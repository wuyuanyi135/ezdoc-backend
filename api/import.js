var feathers = require('feathers');
var rest = require('feathers-rest');
var bodyParser = require ('body-parser');
var service = require('../js/service.js');
var _ = require('lodash');

// Create a feathers instance.
var app = feathers()
  // Enable REST services
  .configure(rest())
  // Turn on JSON parser for REST services
  .use(bodyParser.json())
  // Turn on URL-encoded parser for REST services
  .use(bodyParser.urlencoded({extended: true}));

app.post('/', (req, res) => {

    var body = req.body;

    var entryInfo, applicantInfo;

    entryInfo = _.assign({}, body);

    applicantInfo = {
        applicant: body.applicant;
        applicantPinyin: body.applicantPinyin;
        department: body.department;
        departmentPinyin: body.departmentPinyin;

});

module.exports = app;
