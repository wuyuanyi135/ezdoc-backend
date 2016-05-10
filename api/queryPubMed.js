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
        return object.$[0][attr];
    } catch (e) {
        return null;
    }
}

/**
 * Helper function that reduce array in dateObject to string
 * @param  {object} dateObject
 * @return {object}            modified object
 */
function reduceDate(dateObject) {
    try {
        var modified = {};
        modified.Year = Array.isArray(dateObject.Year)?dateObject.Year[0]:dateObject.Year;
        modified.Month = Array.isArray(dateObject.Month)?dateObject.Month[0]:dateObject.Month;
        modified.Day = Array.isArray(dateObject.Day)?dateObject.Day[0]:dateObject.Day;
        return modified;
    } catch (e) {
        return dateObject;
    }
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
        throw 'The online resource is invalid';
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
                        'type': 'FAILD_TO_PARSE',
                        'message': 'Can not parse target',
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
 * exported router handler. Needed a param `pmid`.
 */
/// need params PMID
function handler(req, res) {
    var pmid = req.params.pmid;
    request(`http://www.ncbi.nlm.nih.gov/pubmed/?term=${pmid}&report=xml&format=text`, (err, resp, body) => {
        if (err) {
            res
                .status(404)
                .json({
                    'type': 'FAILD_TO_LOAD',
                    'message': 'failed to fetch the resource',
                    'error': err
                });
            return;
        }
        parseBody(body)
            .then((result) => {res.json(extractFields(result))})
            .catch((error) => {res.status(400).json(error)});
    });
}
module.exports = {
    'default': handler,
    parseBody,
    extractFields
};
