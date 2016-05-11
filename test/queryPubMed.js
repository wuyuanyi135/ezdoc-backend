var assert = require('mocha').assert;
var should = require('should');
var request = require('request');
var queryPubMed = require('../api/queryPubMed');
var parseString = require('xml2js').parseString;


describe("queryPubMed fetch & parse APIs", () => {
    var object;
    function fetchAndParseTest (pmid, done) {
        request(
            `http://www.ncbi.nlm.nih.gov/pubmed/?term=${pmid}&report=xml&format=text`,
            (err, resp, body) => {
                queryPubMed.parseBody(body).then((obj) => {
                    object = obj;
                    if (done) {
                        done();
                    }
                })
                .catch((err) => {throw err});
            }
        );
    }

    describe("Fetch and parse", () => {
        it('should without error', (done) => {
            should.doesNotThrow( () => {
                fetchAndParseTest("250258", done);
            });
        });
    });
    describe("extractFields", () => {

        it("Author list is empty, no exception and author array is empty", () => {
            should.doesNotThrow( () => {
                var fields = queryPubMed.extractFields(object);
                fields.should.have.property('authors').and.length(0);

            })
        });
    });

});
