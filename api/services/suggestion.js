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
            if (!isNaN(q) && q > 0) {
                // the query will only return pmid results
                service.entryService.find({
                    query: {
                        $select: ['_id', 'pmid', 'articleTitle', 'authors']
                    }
                })
                .then(value => {
                    resolve([{
                        title: "PMID",
                        matching: fuzzy.filter(q, value, pmidFuzzyOptions)
                    }]);
                })
                .catch(err => {reject(err)})
            }
        });
    }
}

app.use('/', serviceModel);

module.exports = {
    'default': app,
    serviceSuggestion: app.service('/')
}
