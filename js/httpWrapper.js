var webserver = require('webserver');
var server = webserver.create();
var lib = require('./libfetch');
var casper = require('casper').create();

var util = require('./phantomUtil');
var port = 19190;
function queryIssnHandler(response, url, casper) {
    var issn = util.getParameterByName("issn", url) || '';
    if (! issn) {
        util.writeError(response, { error: 'issn not provided' });
        return;
    }

    var year = util.getParameterByName("year", url) || '';
    var yearList = year.split(',');
    // we only want year with pure four numbers
    yearList = yearList.filter(function(yr) {
        return /^[0-9]{4}$/.test(yr);
    });

    function done(output, status, result) {
        if (status === 'fail') {
            util.writeError(response, { error: 'fail to get the data', output: output });
            return;
        } else {
            util.writeResponse(response, { response: 'OK', output: output, result: result, status: 'success' });
            return;
        }
    }
    try {
        lib.queryIssn(casper, done, issn, yearList);
        casper.run(function() {});
    } catch (err) {
        util.writeError(response, { error: "fail to execute query issn (exception)", exception: err });
    }
}
function loginHandler(response, url, casper) {
    lib.login(casper, function(output, status) {
        util.writeResponse(response, { response: 'OK', output: output, status: status });
    });
    casper.run(function(){});
}
function logoutHandler(response, url, casper) {
    lib.logout(casper);
    casper.run(function(){});
    util.writeResponse(response, { response: 'OK' });
}
function captureHandler(response, url, casper) {
    var fileName =  util.getParameterByName("filename", url) || "default.png";
    var directDisplay = util.getParameterByName("display", url) || "";
    if (directDisplay) {
        var baseString = casper.captureBase64("png");
        util.writeResponse(response, '<html><body><img alt="Embedded Image" src="data:image/png;base64,' + baseString +'" /></body></html>')
    } else {
        lib.capture(casper, fileName);
        util.writeResponse(response, { response: "OK" });
    }
}
function openHandler(response, url, casper) {
    var redirectUrl = util.getParameterByName("url", url) || "";
    if (!redirectUrl) {
        util.writeError(response, { error: "url not found in query string"});
    }
    casper.thenOpen(redirectUrl);
    casper.run(function() {}); // provide optional after function to prevent default exit behavior;
    util.writeResponse(response, { response: "OK", redirectUrl: redirectUrl });
}
function checkLoginHandler(response, url, casper) {
    var reg = /.*www.fenqubiao.com.*/;
    if (!reg.test(casper.getCurrentUrl())) {
        util.writeError(response, { error: 'Not in designated page', isLogin: false  });
        return;
    }
    casper.reload(function() {
        var existance = casper.exists('#login-form');
        util.writeResponse(response, { response: "OK", isLogin: !existance });
    });
    casper.run(function(){});
}



casper.start();
casper.userAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X)');
casper.viewport(1024, 768);

try {
    server.listen(port, function(request, response) {
        var action;
        try {
            action = util.getParameterByName("action", request.url);
        } catch (err) {
            util.writeError(response, { error: "Fail to get action from url" });
            casper.echo(err);
            return;
        }
        // dispatcher
        try {
            switch (action) {
                case "queryissn":
                    queryIssnHandler(response, request.url, casper);
                    break;
                case "login":
                    loginHandler(response, request.url, casper);
                    break;
                case "logout":
                    logoutHandler(response, request.url, casper);
                    break;
                case "checklogin":
                    checkLoginHandler(response, request.url, casper);
                    break;
                case "geturl":
                    util.writeResponse(response, { response: "OK", url: casper.getCurrentUrl()});
                    break;
                case "test":
                    util.writeResponse(response, { response: "OK" });
                    break;
                case "capture":
                    captureHandler(response, request.url, casper);
                    break;
                case "open":
                    openHandler(response, request.url, casper);
                    break;
                default:
                    util.writeError(response, {error: "invalid action", action: action});
                    casper.echo(action);
            }
        } catch (err) {
            util.writeError({error: "dispatcher error", exception: err});
            casper.echo(err);
        }
    });
} catch (err) {
    casper.echo("Fail to start the server");
    casper.echo(err);
    casper.exit(1);
    casper.bypass(999);
}
