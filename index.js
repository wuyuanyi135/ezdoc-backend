var feathers = require ('feathers');
var app = feathers();
var api = require('./api/index');

app.use('/api',api);

app.listen(8081);
