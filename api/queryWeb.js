var htmlparser = require('htmlparser');
var jsdom = require('jsdom');
var request = require("request");
var parseString = require('xml2js').parseString;

/**
 * Helper function: uniqueText
 * Return the text of a node, if not exist return `null`
 */
function uniqueText(object) {
    try {
        if (object[0]._)
            return object[0]._;
        else
            return object[0];
    } catch (e) {
        try {
            if (object._)
                return object._;
            else
                return object;
        } catch (e) {
            return null;
        }
    }
}

/**
 * Helper function: uniqueObject
 * Return the first object in the object array. If not exist return an empty obj.
 */
function uniqueObject(object) {
    try {
        return object[0];
    } catch (e) {
        return {};
    }
}

/**
 * Helper function: uniqueAttr
 * Return the first attr of a node. If not exist return null.
 */
function uniqueAttr(object, attr) {
    try {
        return object[0].$[attr];
    } catch (e) {
        return null;
    }
}

/**
 * parse the requested body to object. Return a promise. If parse fails,
 * it will be rejected.
 */
function parseBody (body) {
    return new Promise(function(resolve, reject) {
        parseString(body, function(err, result) {
            // internal parse error reporter
            function _reportError(err) {
                return ({
                        'statusText': 'Can not parse target',
                        'error': err
                    });
            }

            if (err) {
                reject(_reportError(err));
            }

            // when the result is valid, there will be a `pre` tag.
            var pre = result.pre;
            if (!pre) {
                reject(_reportError("PMID not found"));
            }

            parseString(pre, function(err, result) {
                if (err || result === {}) {
                    reject(_reportError(err));
                }

                resolve(result);
            });
        });
    });
}

/**
 * Parse input object and return desired fields:
 * TODO: 1. decouple to functions; 2. list the fields
 */
function extractFields(object) {
    // fields with `*` are exported.

    // These pieces of info are critical. Should them missing the online
    // resource is abnormal.
    var body, MedlineCitation, pmid;
    try {
        body = object.PubmedArticle;
        MedlineCitation = uniqueObject(body.MedlineCitation);
        pmid = uniqueText(MedlineCitation.PMID);
    } catch (e) {
        throw 'The online resource is invalid:' + e;
    }

    // Date
    var dateCreated;
    var dateCompleted;
    var dateRevised;
    try {
        dateCreated = reduceDate(uniqueObject(MedlineCitation.DateCreated));
        dateCompleted = reduceDate(uniqueObject(MedlineCitation.DateCompleted));
        dateRevised = reduceDate(uniqueObject(MedlineCitation.DateRevised));
    } catch (e) {
        // do nothing. If any of the date is available, user will see it.
    }

    // Journal info
    var Article, Journal, issnType, issn, journalTitle, journalAbbr, articleTitle;
    try {
        Article = uniqueObject(MedlineCitation.Article);
        Journal = uniqueObject(Article.Journal);
        issnType = uniqueAttr(Journal.ISSN, 'IssnType');
        issn = uniqueText(Journal.ISSN);
        // JournalIssue = uniqueObject(Journal.JournalIssue);
        // pubDate = uniqueObject(JournalIssue.PubDate);
        // volume = uniqueText(JournalIssue.Volume);
        // issue = uniqueText(JournalIssue.issue);

        journalTitle = uniqueText(Journal.Title);
        journalAbbr = uniqueText(Journal.ISOAbbreviation);
        articleTitle = uniqueText(Article.ArticleTitle);
    } catch (e) {
        // do nothing as above.
    } finally {

    }


    // Retrive author info
    var AuthorList, Authors, authors, author, lastName, foreName, name,
        AffiliationInfo, affiliation;
    try {
        var AuthorList = uniqueObject(Article.AuthorList);
        var Authors = AuthorList.Author;
        if (!Authors.length) {
            Authors = [];
        }
        var authors = []; //*
        for (var i = 0; i < Authors.length; i++) {
            var author = Authors[i];
            var lastName = uniqueText(author.LastName);
            var foreName = uniqueText(author.ForeName);
            var collectiveName = uniqueText(author.CollectiveName);
            var initials = uniqueText(author.Initials);
            var name = `${lastName} ${initials}`;
            var AffiliationInfo = uniqueObject(author.AffiliationInfo);
            var affiliation = uniqueText(AffiliationInfo.Affiliation);
            authors.push({
                name,
                lastName,
                foreName,
                collectiveName,
                affiliation
            });
        }
    } catch (e) {
        // Fail to parse author info
        authors = [];
    }

    // Retrive PublicationTypeList
    try {
        var PublicationTypeList = uniqueObject(Article.PublicationTypeList);
        var PublicationTypes = PublicationTypeList.PublicationType;
        if (!PublicationTypes.length) {
            PublicationTypes = [];
        }
        var publicationTypes = []; //*
        for (var i = 0; i < PublicationTypes.length; i++) {
            var publicationType = uniqueText(PublicationTypes[i]);
            publicationTypes.push(publicationType);
        }
    } catch (e) {
        publicationTypes = [];
    }

    return {
        pmid,
        dateCreated,
        dateCompleted,
        dateRevised,
        issn,
        issnType,
        journalTitle,
        journalAbbr,
        articleTitle,
        authors,
        publicationTypes
    };
}
function combineAuthors(obj) {
    if (! 'authors' in obj) {
        return Object.assign({},obj,{authors:[]});
    }

    var authors = Array.isArray(obj.authors)? obj.authors : [];
    var affiliation = authors.map((au) => au.affiliation).filter((item) => item);
    var ret = authors.reduce((previous, current) => {
        if (current.collectiveName) {
            return previous + ", " + current.collectiveName;
        } else {
            return previous + ", " + current.name;
        }
    },"");
    // remove heading comma and space
    ret = /, *(.*)$/.exec(ret)[1];
    return Object.assign({},obj,{authors:ret, affiliation});
}
function filterFields(obj) {
    return {
        issn: obj.issn,
        issnType: obj.issnType,
        authors: obj.authors,
        journalTitle: obj.journalTitle,
        publicationTypes: obj.publicationTypes,
        articleTitle: obj.articleTitle,
        affiliation: obj.affiliation
    }
}

/**
 * fetch - fetch dom tree from website
 *
 * @return {Promise}  resolve a dom tree and reject an error
 */
function fetch(url) {
    return new Promise(function(resolve, reject) {
        jsdom.env({
            url: url,
            done: (error, window) => {

                if (error) {
                    reject(error);
                } else {
                    resolve(window);
                }
            }
        });
    });
}
function fetchXML(url) {
    return new Promise(function(resolve, reject) {
        request(url, (err, resp, body) => {
            if (err) {
                resp = Object.assign({}, resp);
                reject({
                    statusCode: resp.statusCode,
                    statusText: "Failed to request the target",
                    error: err
                });
            } else {
                resolve(body);
            }
            return;
        });
    });
}

function extractCite(window) {
    return window.document.querySelector(".cit").textContent;
}

function handler (req, res) {
    var pmid = req.params.pmid;
    var fetchWebpage = fetch(`http://www.ncbi.nlm.nih.gov/pubmed/?term=${pmid}`)
        .then(extractCite);
    var fetchXmlPage = fetchXML(`http://www.ncbi.nlm.nih.gov/pubmed/?term=${pmid}&report=xml&format=text`)
        .then(parseBody)
        .then(extractFields)
        .then(combineAuthors)
        .then(filterFields)
        .catch((v)=>res.status(400).send(v));

    Promise.all([fetchWebpage, fetchXmlPage])
        .then((v)=>{
            res.json(Object.assign({},{source: v[0]}, v[1]));
        })
        .catch((v)=>{res.status(400).send(v)});
}

module.exports = {
    extractCite,
    fetch,
    'default': handler
};
