var feathers = require('feathers');
var rest = require('feathers-rest');
var bodyParser = require ('body-parser');
var service = require('../js/service.js');
var checkPMIDExistance = require('../js/checkPMIDExistance.js').default;
var _ = require('lodash');

// Create a feathers instance.
var app = feathers()
  // Enable REST services
  .configure(rest())
  // Turn on JSON parser for REST services
  .use(bodyParser.json())
  // Turn on URL-encoded parser for REST services
  .use(bodyParser.urlencoded({extended: true}));

app.get('/pmid/:pmid', (req, res) => {
    checkPMIDExistance(req.params.pmid);
    res.send("OK");
});

module.exports = app;
