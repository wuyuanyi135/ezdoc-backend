var _ = require('lodash');
var request = require('request');

self = module.exports = {
    fetchAsync: function(url) {
        return new Promise(function(resolve, reject) {
            request(url, (err, resp, body) => {
                if (err) {
                    reject("Failed to fetch");
                    return;
                }

                resolve(body);
            });
        });
    },
    /**
     * strip html tags and get the medline body
     */
    extractBody: function(body) {
        var ret =  /<pre>\s*([\s\S]*?)\s*<\/pre>/.exec(body)[1];
        if (ret==="") {
            throw ("PMID NOT FOUND");
        }
        return ret;
    },
    medlineToObject: function (body) {
        // global regex take the fields and values apart.
        // Multiline values are considered
        var reg = /^(.*?)\s*\-\s*(((?!\n[A-Z])[\S\s])*)/gm;
        var obj = {};
        var tmp;
        while (tmp = reg.exec(body)) {
            var tmpObj = {};
            // remove \n and multiple spaces in value.
            tmp[2] = tmp[2].replace(/\s+/gm,' ');
            if (tmp[1] in obj) {
                var tmpArray = _.castArray(obj[tmp[1]]);
                tmpArray.push(tmp[2]);
                tmpObj[tmp[1]] = tmpArray;
            } else {
                tmpObj[tmp[1]] = tmp[2];
            }
            obj = _.assign({},obj,tmpObj);
        }
        return obj;
    },
    'default': function handler(req, res) {
        var pmid = req.params.pmid;
        self.fetchAsync(`http://www.ncbi.nlm.nih.gov/pubmed/?term=${pmid}&report=medline&format=text`)
            .then(body => self.extractBody(body))
            .then(content => self.medlineToObject(content))
            .then(obj => res.send(obj))
            .catch(error => {res.status(400).send(error)});
    }
}
