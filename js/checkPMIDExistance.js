var service = require('./service');

module.exports = {
    'default': function(pmid) {
        return service.entryService.find({ query: { pmid, $limit: 1 } })
            .then(doc => doc.length != 0);
    }
}
