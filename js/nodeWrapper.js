const spawn = require('child_process').spawn;
const casper = spawn('casperjs.cmd', ['js/fetchIOWrapper.js']);

casper.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

casper.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`);
});

casper.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});

setTimeout(()=>casper.stdin.write('asdfasdf\r\n'),10000);
