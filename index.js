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


var process = require('process');

const spawn = require('child_process').spawn;
const sciServer = spawn('casperjs.cmd', ['js/httpWrapper.js']);

process.stdin.resume();//so the program will not close instantly
function exitHandler(options, err) {
    sciServer.kill();
    console.log('Exiting!');
    console.log(err);
    process.exit();
}
sciServer.stdout.on('data', (data) => {
  console.log(`[SCISERVER] stdout: ${data}`);
});

sciServer.stderr.on('data', (data) => {
  console.log(`[SCISERVER] stderr: ${data}`);
});

sciServer.on('close', (code) => {
  console.log(`[SCISERVER] child process exited with code ${code}`);
});
//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

// for nodemon
process.on('SIGUSR2', exitHandler.bind(null, {exit: true}));
