var NeDB = require('nedb');

var entryDB = new NeDB({
  filename: 'database/entry.db',
  autoload: true
});

module.exports = {
    entryDB
};
