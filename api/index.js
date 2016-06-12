var constants = require('./constants');
var feathers = require('feathers');
var rest = require('feathers-rest');
var hooks = require('feathers-hooks');
var bodyParser = require('body-parser');
var proxy = require('http-proxy-middleware');
var sciServerAdmin = require('./services/sciServerAdmin.js');
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
app.use('/suggestion', require('./services/suggestion.js').default);
app.use('/sci', require('./services/sciInfo.js').model);

app.use('/sciserver', (req, res, next) => {
    console.log('Detected request to sci server, flush login keeper');
    sciServerAdmin.flushTimer();
    next();
})
app.use('/sciserver', proxy({ target: 'http://localhost:19190/', pathRewrite: { '^/api/sciserver': '' } }));
// app.use('/exist', require('./exist.js'));

module.exports = app;
