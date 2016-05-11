var feathers = require('feathers');
var app = feathers();
var constants = require('./constants');
app.get('/', (req, res) => {
    res.json({
        version: constants.version
    });
});

app.get('/query/pmid/:pmid', require('./queryWeb').default);

module.exports = app;
