var feathers = require('feathers');
var rest = require('feathers-rest');
var bodyParser = require ('body-parser');
var service = require('../js/service.js');

// Create a feathers instance.
var app = feathers()
  // Enable REST services
  .configure(rest())
  // Turn on JSON parser for REST services
  .use(bodyParser.json())
  // Turn on URL-encoded parser for REST services
  .use(bodyParser.urlencoded({extended: true}));


app.use('/entry', service.entryService);
app.use('/applicant', service.applicantService);

module.exports = app;
