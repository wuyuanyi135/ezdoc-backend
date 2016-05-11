var htmlparser = require('htmlparser');
var jsdom = require('jsdom');
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
                    console.log("reject");
                    reject(error);
                } else {
                    console.log("resolve");
                    resolve(window);
                }
            }
        });
    });
}

function extractSource(window) {
    return window.document.querySelector(".cit").textContent;
}
function handler (req, res) {
    var pmid = req.params.pmid;
    fetch(`http://www.ncbi.nlm.nih.gov/pubmed/?term=${pmid}`)
    .then((v)=>{console.log(v.document.querySelector(".cit").textContent);res.send(v.document.querySelector(".cit"))})
    .catch((v)=>{res.status(400).send(v)});
}

module.exports = {
    extractSource,
    fetch,
    'default': handler
};
