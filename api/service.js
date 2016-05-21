var feathers = require('feathers');
var rest = require('feathers-rest');
var hooks = require('feathers-hooks');
var bodyParser = require ('body-parser');
var errors = require('feathers-errors');
var db = require('../js/database.js');
var _ = require('lodash');
var service = require('feathers-nedb');
var entryDBService = service({Model: db.entryDB});
var applicantDBService = service({Model: db.applicantDB});
// Create a feathers instance.
var app = feathers()
  // Enable REST services
  .configure(rest())
  .configure(hooks())
  // Turn on JSON parser for REST services
  .use(bodyParser.json())
  // Turn on URL-encoded parser for REST services
  .use(bodyParser.urlencoded({extended: true}));

  app.use('/entry', entryDBService);
  app.use('/applicant', applicantDBService);

  var entryService = app.service('/entry');
  var applicantService = app.service('/applicant');

  function checkPMIDExistance (pmid) {
      return new Promise(function(resolve, reject) {
          if (pmid) {
              entryService.find({ query: { pmid, $limit: 1 } })
                  .then((arrValue) => {
                      if (_.castArray(arrValue).length) {
                          resolve(true);
                          return;
                      } else {
                          resolve(false);
                          return;
                      }
                  });
          } else {
              reject ( new errors.BadRequest("PMID Not Provided") );
          }
      });
  }

  app.service('/entry').before ({
      create: function(hook, next) {
          checkPMIDExistance(_.get(hook,'data.pmid'))
              .then((value) => {
                  if (value) {
                      throw new errors.Conflict("PMID Exists");
                  }
                  next();
              })
              .catch((err) => {next(err,hook)});
      }
  });

module.exports = {
    'default': app,
    entryService,
    applicantService
};
