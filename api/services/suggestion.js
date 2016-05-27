var feathers = require('feathers');
var _ = require('lodash');
var hooks = require('feathers-hooks');
var rest = require('feathers-rest');
var service = require('../service.js');
var fuzzy = require('fuzzy');


var app = feathers()
    .configure(rest())
    .configure(hooks());

const fuzzyOptions = {
    pre: '<b>',
    post: '</b>'
};
const pmidFuzzyOptions = _.assign({}, fuzzyOptions, {extract: (arg) => arg.pmid});
const titleOptions = _.assign({}, fuzzyOptions, {extract: (arg) => arg.articleTitle});

var serviceModel = {
    find: function(params) {
        return new Promise(function(resolve, reject) {
            // var limit = 100; // TODO: probabily slow performance when database grows large.
            // We can use a instance to persist the values.
            var query = params.query;
            if (! ('q' in query)) {
                resolve([]);
                return;
            }
            var q = query.q;
            if (!isNaN(q)) {
                // the query will only return pmid results
                // Put here rather than above if because other case will query applicant db
                service.entryService.find({
                    query: {
                        $select: ['_id', 'pmid', 'articleTitle', 'authors']
                    }
                })
                .then(value => {
                    resolve([{
                        title: "PMID",
                        matching: _(value)
                                    .map(v => {
                                        var string
                                        if ( (new RegExp(`^${q}`)).test(v.pmid)){
                                            string = v.pmid.replace(`${q}`, `<b>${q}</b>`);
                                        } else {
                                            return null;    // so can be filtered by without
                                        }

                                        return {string, original:v}
                                    })
                                    .without(null)
                                    .take(10)  //change the order to optimize the performance

                    }]);
                }).catch(err => {reject(err)});
            } else { // if is number
                // is literatural string
                var entryPromise = service.entryService.find({
                    query: {
                        $select: ['_id', 'pmid', 'articleTitle', 'authors']
                    }
                })
                .then(value => {
                    return [{
                        title: "Title",
                        matching: fuzzy.filter(q, value, titleOptions)
                    }];
                });

                var applicantPromise = service.applicantService.find({
                    query: {
                        $select: ['_id', 'pmid', 'applicant', 'applicantPinyin']
                    }
                })
                .then(value => ({
                    title: "Applicant",
                    matching: _(value).map((item) => {
                                    if (fuzzy.test(q, `${item.applicant} ${item.applicantPinyin}`)) {
                                        return {string: item.applicant, original:item};
                                    } else {
                                        return null;
                                    }
                                })
                                .without(null)
                                .take(10)
                    })
                );

                Promise.all([applicantPromise, entryPromise])
                    .then((suggestions)=>{
                        resolve(_.flatten(suggestions));
                    });
            } //else

        });
    }
}

app.use('/', serviceModel);

module.exports = {
    'default': app,
    serviceSuggestion: app.service('/')
}
