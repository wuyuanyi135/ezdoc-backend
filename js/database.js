var NeDB = require('nedb');

var entryDB = new NeDB({
  filename: 'database/entry.db',
  autoload: true
});

var applicantDB = new NeDB({
    filename: 'database/applicant.db',
    autoload: true
});

module.exports = {
    entryDB,
    applicantDB
};
