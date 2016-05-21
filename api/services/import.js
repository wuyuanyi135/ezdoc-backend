var _ = require('lodash');
var errors = require('feathers-errors');
var service = require('../service.js');
module.exports = {
    create: function create(data, params, callback) {
        // data (body) should contain these objects
        // 1. data : pmid
        // 2. applicant (optional)
        return new Promise(function(resolve, reject) {
            var pmid = _.get(data, 'data.pmid');
            if (!pmid) {
                throw ( new errors.BadRequest('Excepting PMID'));
            }

            service.entryService.create(data.data)
                .then((createdEntry) => {
                    // successfully create entry document
                    var applicant;
                    if (applicant = data.applicant) {
                        if (!createdEntry.pmid) {
                            reject( new errors.BadRequest("Internal Error: entry does not have PMID"));
                            return;
                        }
                        applicant.pmid = createdEntry.pmid;
                        service.applicantService.create(applicant)
                            .then((createdApplicant) => resolve({createdApplicant, createdEntry}));
;
                    }
                })
                .catch((err) => {reject(err)});
        });

    }
}
