var assert = require('chai').assert;
var queryWeb = require('../api/queryWeb.js');
/**
 *  We use PMID = 25825010 as test object
 */

var url = "http://www.ncbi.nlm.nih.gov/pubmed/25825010";
var correctSource = "Interact Cardiovasc Thorac Surg. 2015 Jul;21(1):119-20. doi: 10.1093/icvts/ivv073. Epub  2015 Mar 29."
var correctAuthorList = "Chen JT1, Liao CP2, Chiang HC1, Wang BY3."

describe('query source and author infomation from website', function () {
    var _window;
    this.timeout(30000);
    before((done) => {
        console.log('fetch jsdom window');
        queryWeb.fetch(url)
            .then((window) => {
                console.log("success!");
                _window = window;
                done();
            })
            .catch((error) => {
                console.log("fail!");
                throw error;
            });
    });

    it('test source', function () {

        assert.equal(correctSource, queryWeb.extractSource (_window));
    });
});
