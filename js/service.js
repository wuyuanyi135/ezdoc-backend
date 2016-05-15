var db = require('./database.js');
var service = require('feathers-nedb');

var entryService = service({Model: db.entryDB});
var applicantService = service({Model: db.applicantDB});

module.exports = {
    entryService,
    applicantService
};
