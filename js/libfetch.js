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

var loginFormSelector = '#login-form';
function login(casper, done) {
	var output = "";
	var _done = done || function(){};
	function echo(content) { casper.echo(content); }
	echo('[login] login preparing');
    casper.thenOpen('http://www.fenqubiao.com/');

    casper.waitForSelector(loginFormSelector, function() {
		echo('[login] login form loaded');
    	output += 'Login form loaded, start to fill the form\r\n';
		this.evaluate(function(username, password){
			document.querySelector('#Username').value = username;
			document.querySelector('#Password').value = password;
		}, config.username, config.password);
    	/*this.fill(loginFormSelector, {
    		'Username': config.username,
    		'Password': config.password
    	}, false);*/
    	this.click('#login_button');
		echo('[login] login button clicked');
    },
	function() {
		//timeout
		echo('[login] after login timeout');
		output += 'login form load timeout\r\n';
		_done(output, 'fail');
	});

    casper.waitForUrl('http://www.fenqubiao.com/Core/CategoryList.aspx',		//Url changed on 2016 Nov 4
		function() {
			//then
			echo('[login] login success');

			output += 'login success\r\n';
			casper.thenOpen('http://www.fenqubiao.com/Core/Search.aspx');
			_done(output, 'success');
		},
		function(){
			//timeout
			echo('[login] login failed');
	    	output += 'Can not load Catalog\r\n';
	    	_done(output, 'fail');
    });
}
function logout(casper) {
	casper.thenOpen("http://www.fenqubiao.com/Core/ToDefault.ashx?id=2758");
}

function contains(small, big) {
	for (var i = 0; i < big.length; i++) {
		if (big[i] === small) {
			return true;
		}
	}
	return false;
}
function queryIssn(casper, done, issn, year) {
	function echo(content) { casper.echo(content); }
	var _done = done || function(){};
	var _year = [];
	var log = '';
	if (year && !Array.isArray(year)) {
		_year = [year];
	} else {
		_year = year;
	}

	if (! /^\S{4}-\S{4}$/.test(issn)) {
		log += 'Invalid ISSN: '+ issn + '\r\n';
		_done(log, 'fail');
		return;
	}
	echo("[queryIssn] preparation done: issn=" + issn + " years=" + _year + '\r\n');
	//reload the page, to avoid existing table selector;
	casper.thenOpen('http://www.fenqubiao.com/Core/Search.aspx');

	casper.waitForSelector('#ContentPlaceHolder1_tbxTitleorIssn', null, function() {
		log += "failed to load issn textbox: " + issn + '\r\n';
		echo("[queryIssn] failed to load issn textbox: " + issn );
		_done(log, 'fail');
		casper.bypass(999);
		return;
	});

	// fill issn and click search
	casper.thenEvaluate(function(issn){
		document.querySelector("#ContentPlaceHolder1_tbxTitleorIssn").value = issn;
		document.querySelector('#ContentPlaceHolder1_btnSearch').click();
	},issn);
	
	// 2016 Nov 4 changed search process
	casper.waitForSelector('#report', function() {
		if ( issn != casper.fetchText('#report tbody tr:nth-child(1) td:nth-child(3)')) {
			echo("[queryIssn] issn validation failed!");
			log += 'issn validation failed!';
			_done(log, 'fail');
			casper.bypass(999);
			return;
		} else {
			// validation succeed
			var pageHref = this.evaluate(function() {
				return document.querySelector('#report tbody tr:nth-child(1) td:nth-child(2) a').href;
			});
			echo("[queryIssn] redirecting to pageHref = " + pageHref);
			this.open(pageHref);
		}
	}, function() {
		// timeout
		echo("[queryIssn] search result load failed!");
		log += 'search result load failed';
		_done(log, 'fail');
		casper.bypass(999);
		return;
	});

	
	var result = [];
	casper.waitForSelector('#detailJournal', function() {
		var yearList = this.evaluate(function(){
			// year
			var yearNumbers = document.querySelector("#impactfactorlist tr td").colSpan - 1;
			var targetRow = Array.prototype.slice.call(document.querySelectorAll("#impactfactorlist tr:nth-child(2) td"));
			var targetCells = targetRow.slice(0, yearNumbers);
			var years = targetCells.map(function(item) {
				return item.innerHTML.slice(0, -1);
			});
			
			return years;
			// factor
			/*return [].slice.call(
				document.querySelectorAll("#ContentPlaceHolder1_dplYear > option")
			)
			.map(function(item){return item.textContent});*/
		});

		yearList = ['2008', '2009', '2010', '2011', '2012', '2013', '2014', '2015'];
		var keyYears = [];
		if (_year.length > 0) {
			// user provides year, filter unavailable years
			echo("[queryIssn] year list provided");
			keyYears = _year.filter(function(item){
				return contains(item, _year);
			});
		} else {
			// no year specified, use all years;
			keyYears = yearList;
		}
		log += 'keyYears: ' + keyYears + '\r\n';
		echo("[queryIssn] keyYears: " + keyYears );

		// start iterate
		keyYears.map(function(year) {
			casper.then(function() {
				log += "Fetching data of " + year +'\r\n';
				casper.evaluate(function(year){
					/*
					var selectList = document.querySelector('#ContentPlaceHolder1_dplYear');
					selectList.value=year.toString();
					selectList.onchange();
					*/
					var tmp = window.location.search;
					tmp = tmp.replace(/(y=).*?(&)/,"$1"+year+"$2");
					window.location.search = tmp;
				},year);
			});

			//casper.waitFor(function() {
			//	return casper.evaluate(function(year) {
			//		return year == document.querySelector("#detailJournal > tbody > tr:nth-child(3) > td:nth-child(2)").textContent.slice(0,-1);
			//	}, year);
			//},
			casper.then(
			function(){
				// after get the table
				var minSection = casper.evaluate(function() {
					return [].slice.apply(document.querySelectorAll(".section")).reduce(function(p,c){return c.textContent<p?c.textContent:p},9999);
				});
				var impact = casper.evaluate(function(){
					return document.querySelector("#impactfactorlist > tbody > tr:nth-child(3) > td:nth-child(3)").textContent;				});
				log += year + " : section = " + minSection + " : IF = " + impact + '\r\n';
				echo("[queryIssn] " + year + " : section = " + minSection + " : IF = " + impact );
				casper.capture(year+".png");
				result.push({
					year: year,
					section: minSection,
					impact: impact
				});
				casper.wait(fetchInterval);
			},
			function(){
				//timeout for a specific year
				log += 'failed to get data of year ' + year + '\r\n';
				echo('[queryIssn] failed to get data of year ' + year);
			}, 3000);
		});

		casper.then(function(){
			echo('[queryIssn] Task completed');
			log += "Task completed\r\n";
			_done(log, 'success', result);
			return;
		});
	},
	function() {
		// cannot load detailedJournal panel
		log += 'failed to load detailedJournal panel (check issn existance)';
		echo('[queryIssn] failed to load detailedJournal panel');
		_done(log, 'fail');
		casper.bypass(999);
	});
}
function capture(casper, name) {
    return casper.capture(name || 'default.png');
}

module.exports = {
    capture: capture,
    login: login,
	logout: logout,
	queryIssn: queryIssn
}
