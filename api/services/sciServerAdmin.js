var request = require('request');
const checkInterval = 5 * 1000 * 60; // 5min
const url = 'http://localhost:8081/api/sciserver';

const checkLoginHandler = () => {
    console.log('checking login status');
    request(`${url}?action=checklogin`, (err, response, body) => {
        var _body;
        try {
            _body = JSON.parse(body);
        } catch (e) {
            console.error('Fail to parse checklogin json', e);
            console.error('The parsed object is', body);
            return;
        }

        if (err) {
            console.log('Fail to communicate with sci server');
            return;
        }

        if (_body.isLogin === false) {
            console.log('not login, start to login');
            request(`${url}?action=login`, (err, response, body) => {
                var _body;
                try {
                    _body = JSON.parse(body);
                } catch (e) {
                    console.log('Fail to parse login json', e);
                    return;
                }

                if (err) {
                    console.log('Fail to relogin', _body);
                    return;
                }
                if (_body.status === "success") {
                    console.log('relogin succeed');
                } else {
                    console.log('relogin failed', _body);
                }
            });
        } else {
            console.log('logged in');
        }
    });
}
var checkIntervalTimer;

flushTimer = () => {
    if (! checkIntervalTimer) {
        // first run
        console.log('first run, will login after 1s');
        setTimeout(checkLoginHandler,8000);
    } else {
        clearInterval(checkIntervalTimer);
    }
    checkIntervalTimer = setInterval(checkLoginHandler, checkInterval);
}
flushTimer();
module.exports = {
    checkIntervalTimer,
    flushTimer
};
