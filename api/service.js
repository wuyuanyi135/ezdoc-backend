var feathers = require('feathers');
var rest = require('feathers-rest');
var hooks = require('feathers-hooks');
var bodyParser = require ('body-parser');
var errors = require('feathers-errors');
var db = require('../js/database.js');
var _ = require('lodash');
var service = require('feathers-nedb');
var entryDBService = service({Model: db.entryDB});
var historyDBService = service({Model: db.historyDB});

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
  app.use('/history', historyDBService);

  var entryService = app.service('/entry');
  var historyService = app.service('/history');
 /**
  * Returning `true`: has existance
  * Returning `false`: no existance
  *
  * if no PMID field, its always false
  */
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
              // no-PMID type entry is now accepted
              //   reject ( new errors.BadRequest("PMID Not Provided") );
              resolve(false);
          }
      });
  }
/**
 * Feathers hook used to validate if pmid exists
 */
function validatePMIDHook(hook, next) {
    checkPMIDExistance(_.get(hook,'data.pmid'))
        .then((value) => {
            if (value) {
                throw new errors.Conflict("PMID Exists");
            }
            next();
        })
        .catch((err) => {next(err,hook)});
};

function appendDateHook(hook, next) {
    hook.data.createdAt = Date.now();
    hook.data.LastModifiedAt = Date.now();
    next();
}

function populateRecentExport(hook, next) {
    let p = Promise.resolve();
    _.castArray(hook.result).map((item, index) => {
        p = p.then(() => (
            entryService.get(item.refId)
        ))
        .then(value => {
            item.articleTitle = value.articleTitle;
            item.pmid = value.pmid;
        });
    });
    //p.then(value => {console.log(hook);})
    p.then(() => next(null, hook));
}
entryService.before ({
    create: [validatePMIDHook, hooks.pluck('data', 'applicant'), appendDateHook]
});
historyService.before({
    create: [appendDateHook]
});
historyService.after({
    find: [populateRecentExport]
})

module.exports = {
    'default': app,
    entryService,
    historyService
};
