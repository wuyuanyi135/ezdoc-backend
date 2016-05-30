var casper = require('casper').create();
var system = require('system');

var config = {
	username: "wzykdx",
	password: "wzykdxfqb"
};
var fetchInterval = 500;

function writeLog(str) {
	system.stderr.writeLine(str);
}
function writeResult(str) {
	system.stdout.writeLine(str);
}

issn = system.args[system.args.length - 1];
if (! /\S{4}-\S{4}/.test(issn)) {
	writeLog("Incorrect ISSN: " + issn);
	exit(1);
}
writeLog("ISSN: " + issn);

casper.start('http://www.fenqubiao.com/');

var loginFormSelector = '#login-form';
casper.waitForSelector(loginFormSelector, function() {
	writeLog('Login form loaded, start to fill the form');
	this.fill(loginFormSelector, {
		'Username': config.username,
		'Password': config.password
	}, false);
	this.click('#login_button');
});

casper.waitForUrl('http://www.fenqubiao.com/Core/Category.aspx',null, function(){
	writeLog("Can not load Catalog");
	casper.exit(1);
});

casper.thenOpen('http://www.fenqubiao.com/Core/Search.aspx');

casper.waitForSelector('#ContentPlaceHolder1_tbxTitleorIssn', null, function() {
	writeLog("Can not load selector: issn input");
	casper.exit(1);
});

casper.thenEvaluate(function(issn){
	document.querySelector("#ContentPlaceHolder1_tbxTitleorIssn").value = issn;
	document.querySelector('#ContentPlaceHolder1_btnSearch').click();
},issn);

var output = [];
casper.waitForSelector('#detailJournal', function() {
	writeLog('filled issn, start fetching');
	//Fetch year list
	var yearList = this.evaluate(function(){
		return [].slice.call(
			document.querySelectorAll("#ContentPlaceHolder1_dplYear > option")
		)
		.map(function(item){return item.textContent});
	})
	writeLog("Year list fetched, iterating ...");
	yearList.map(function(year) {
		var self = casper;
		self.then(function(){
			writeLog("Fetching data of " + year);
			self.evaluate(function(year){
				var selectList = document.querySelector('#ContentPlaceHolder1_dplYear');
				selectList.value=year.toString();
				selectList.onchange();
			},year);
		});

		self.waitFor(function() {
			return self.evaluate(function(year){
				return year == document.querySelector("#detailJournal > tbody > tr:nth-child(3) > td:nth-child(2)").textContent.substr(0,4)
			}, year);
		}, function(){
			// get minimal section number
			var minSection = self.evaluate(function(){
				return [].slice.apply(document.querySelectorAll("#categorylist > tbody td.section")).reduce(function(p,c){return c.textContent<p?c.textContent:p},9999);
			});

			var impact = self.evaluate(function(){
				return document.querySelector("#impactfactorlist > tbody > tr:nth-child(2) > td:nth-child(3)").textContent;
			});
			writeLog(year + " : section = " + minSection + " : IF = " + impact);
			output.push({
				year: year,
				section: minSection,
				impact: impact
			});
			self.wait(fetchInterval);
		}, function(){
			// timeout
			writeLog("can not yearly data");
			// casper.exit(1);
		}, 3000);
	});

	this.then(function(){
		writeLog("Task completed");
		writeResult(JSON.stringify(output));
		casper.exit(0);
	})
}, function timeout(){
	writeLog("can not load detail");
	casper.exit(1);
});


casper.run();
