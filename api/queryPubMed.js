var request = require("request");
var parseString = require('xml2js').parseString;

function uniqueText(object) {
    try {
        if(object[0]._) 
            return object[0]._;
        else 
            return  object[0];
    } catch (e) {
        try {
            if(object._) 
                return object._;
            else 
                return  object;
        } catch (e) {
            return null;
        }
    }
}

function uniqueObject(object) {
    try {
        return object[0];
    } catch (e) {
        return {};
    }
}
function uniqueAttr(object, attr) {
    try {
        return object.$[0][attr];
    } catch (e) {
        return null;
    }    
}

function extractFields(object) {
 
    var body = object.PubmedArticle;
    var MedlineCitation = uniqueObject(body.MedlineCitation);
    
        var pmid = uniqueText(MedlineCitation.PMID);
        
        var dateCreated = uniqueObject(MedlineCitation.DateCreated);
        var dateCompleted = uniqueObject(MedlineCitation.DateCompleted);
        var dateRevised = uniqueObject(MedlineCitation.DateRevised);
            var Article = uniqueObject(MedlineCitation.Article);
                var Journal = uniqueObject(Article.Journal);
                    var issnType = uniqueAttr(Journal.ISSN, 'IssnType');
                    var issn = uniqueText(Journal.ISSN);
                
                    var journalTitle = uniqueText(Journal.Title);
                    var journalAbbr = uniqueText(Journal.ISOAbbreviation);
                var articleTitle = uniqueText(Article.ArticleTitle) ;
                var AuthorList = uniqueObject(Article.AuthorList);
                    var Authors = AuthorList.Author;
                    if (!Authors.length) {
                        Authors = [];
                    }
                    var authors = [];   //*
                    for (var i = 0; i < Authors.length; i++) {
                        var author = Authors[i];
                        var lastName = uniqueText(author.LastName);
                        var foreName = uniqueText(author.ForeName);
                        var name = `${foreName} ${lastName}`; 
                        var AffiliationInfo = uniqueObject(author.AffiliationInfo);
                        var affiliation = uniqueText(AffiliationInfo.Affiliation);
                        authors.push({
                            name,
                            lastName,
                            foreName,
                            affiliation
                        });
                    }
                
                var PublicationTypeList = uniqueObject(Article.PublicationTypeList);
                    var PublicationTypes = PublicationTypeList.PublicationType;
                    if (! PublicationTypes.length) {
                        PublicationTypes = [];
                    }
                    var publicationTypes = [];  //*
                    for (var i = 0; i < PublicationTypes.length; i++) {
                        var publicationType =  uniqueText(PublicationTypes[i]);
                        publicationTypes.push(publicationType);
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

/// need params PMID
module.exports = (req, res) => {
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

        parseString(body, function(err, result) {
            function _reportError(err) {
                res.status(400)
                    .json({
                        'type': 'FAILD_TO_PARSE',
                        'message': 'Can not parse target',
                        'error': err
                    });
                    
            }
            
            if (err) {
                _reportError(err);
                return ;
            }
            
            var pre = result.pre;
            if (!pre) {
                _reportError("PMID not found");
                return;
            }
            
            parseString(pre, function(err, result) {
                if (err || result === {}) {
                    _reportError(err);
                    return ;
                }
                res.json(extractFields(result));

            });
        });
    });

}