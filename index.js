feathers = require ('feathers');

var app = feathers();
var queryPMID = require("./api/queryPubMed");

app.get('/', (req, res) => res.send('meh') );

app.get('/query/PMID/:pmid', queryPMID);

app.listen(8080);