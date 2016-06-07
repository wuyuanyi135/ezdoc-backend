var feathers = require ('feathers');
var rest = require('feathers-rest');
var errorHandler = require('feathers-errors/handler');
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

var api = require('./api/index');

app.use('/api',api);
app.use(feathers.static('static'));
app.use(errorHandler());
app.listen(8081);
