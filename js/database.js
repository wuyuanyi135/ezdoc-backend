var NeDB = require('nedb');

var entryDB = new NeDB({
  filename: 'database/entry.db',
  autoload: true
});
var historyDB = new NeDB({
    filename: 'database/history.db',
    autoload: true
})
module.exports = {
    entryDB,
    historyDB
};
