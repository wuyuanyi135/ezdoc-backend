var errors = require('feathers-errors');
var feathers = require('feathers');
var rest = require('feathers-rest');
var errors = require('feathers-errors');
var exec = require('child_process').exec;

var app = feathers()
    .configure(rest())

var sciInfoServiceModel = {
    get: function(id) {
        return new Promise(function(resolve, reject) {
            if (! /^\S{4}-\S{4}$/.test(id) ) {
                reject(new errors.BadRequest("Invalid ISSN"));
            }
            var casperjs = (process.platform === "win32" ? "casperjs.cmd" : "casperjs");
            var fetch = exec(`${casperjs} js/fetch.js ${id}`, (error, stdout, stderr) => {
                if (error) {
                    throw new errors.BadRequest('Server Error', error);
                }

                resolve({
                    result: stdout,
                    log: stderr
                });
            });
        });
    }
};

app.use('/', sciInfoServiceModel);

module.exports = {
    'default': app,
    sciInfoService: app.service('/'),
    model: sciInfoServiceModel
};
