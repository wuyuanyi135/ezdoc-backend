var feathers = require('feathers');
var app = feathers();
var constants = require('./constants');
app.get('/', (req, res) => {
    res.json({
        version: constants.version
    });
});

app.get('/query/pmid/:pmid', require('./queryWeb').default);
app.use('/service', require('./service'));
app.use('/import', require('./import.js'));

module.exports = app;
