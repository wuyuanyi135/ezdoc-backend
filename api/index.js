var constants = require('./constants');
var feathers = require('feathers');
var rest = require('feathers-rest');
var hooks = require('feathers-hooks');
var bodyParser = require('body-parser');

// Create a feathers instance.
var app = feathers()
  // Enable REST services
  .configure(rest())
  .configure(hooks())
  // Turn on JSON parser for REST services
  .use(bodyParser.json())
  // Turn on URL-encoded parser for REST services
  .use(bodyParser.urlencoded({extended: true}));


app.get('/', (req, res) => {
    res.json({
        version: constants.version
    });
});

app.get('/query/pmid/:pmid', require('./queryMedline.js').default);
app.use('/service', require('./service').default);
app.use('/import', require('./services/import.js'));
// app.use('/exist', require('./exist.js'));

module.exports = app;
