/**
 * @fileoverview Code that powers the SacTraffic Widget.  Simply call this
 * script where you want the widget.
 */

// Set up the DOM structure we later modify.
document.write('<div id="sactraffic_widget"><div class="head">Sacramento Traffic Incidents</div><ul></ul><div class="foot">From: <a href="http://www.sactraffic.org">http://www.sactraffic.org</a></div></div>');

/* Template substitution (source: Doug Crockford) */
if (typeof String.prototype.supplant !== 'function') {
	/**
	 * Template substitution.
	 * @param {Object} o An object of keys to replace.
	 */
	String.prototype.supplant = function (o) {
		return this.replace(/{([^{}]*)}/g, function (a, b) {
			var r = o[b];
			return typeof r === 'string' ? r : a;
		});
	};
}

/**
 * Extention of the Date class to support a Twittereque "ago" time.
 */
Date.prototype.ago = function () {
	var now = new Date();
	var seconds_ago = (now.getTime() - this.getTime()) / 1000;

	var template = "over {time} day{s} ago";
	var time = Math.floor(seconds_ago / 86400);
	var s = (time == 1) ? "" : "s";

	if (seconds_ago < 60) {
		return "less than a minute ago";
	} else if (seconds_ago < 3600) {
		template = "{time} minute{s} ago";
		time = Math.round(seconds_ago / 60);
		s = (time == 1) ? "" : "s";
	} else if (seconds_ago < 86400) {
		template = "over {time} hour{s} ago";
		time = Math.floor(seconds_ago / 3600);
		s = (time == 1) ? "" : "s";
		if (time == 1) time = "an";
	}

	return template.supplant({time: time.toString(), s: s});
};

if (typeof SacTraffic === 'undefined') {
	/** @namespace Namespace for the SacTraffic Widget */
	var SacTraffic = { };
}

/** Default number of entries to show */
SacTraffic.showNum = 10;

/**
 * Script node util function via Script DOM Element and Script onLoad techniques.
 * @param {String} url Script source.
 * @param {Function} cbfunc Callback function.
 *
 * @see Even Faster Web Sites, Souders
 */
SacTraffic.addScriptNode = function(url, cbfunc) {
	var doc = document;
	var domscript = doc.createElement('script');
	domscript.setAttribute('src', url);
	domscript.setAttribute('type', 'text/javascript');
	domscript.onloadDone = false;
	domscript.onload = function() {
		domscript.onloadDone = true;
		cbfunc();
	};
	domscript.onreadystatechange = function() {
		if (( "loaded" === domscript.readyState || "complete" === domscript.readyState ) && ! domscript.onloadDone) {
			domscript.onloadDone = true;
			cbfunc();
		}
	};
	//doc.getElementsByTagName('body')[0].appendChild(domscript);
	doc.getElementById('sactraffic_widget').appendChild(domscript);
};

/**
 * Add CSS link node to pull in external stylesheet.
 * @param {String} url Stylesheet source.
 */
SacTraffic.addStyleNode = function(url) {
	var doc = document;
	var stylenode = doc.createElement('link');
	stylenode.setAttribute('rel', 'stylesheet');
	stylenode.setAttribute('href', url);
	doc.getElementsByTagName('head')[0].appendChild(stylenode);
};

/**
 * Get the query string args for a given script tag
 * @returns {Object} an object if query string present, empty object if absent
 *
 * For example, if this script is invoked with [script src="script.js?foo=bar&baz=bat"]
 *	  this function will return {foo: 'bar', baz: 'bat'}
 */
SacTraffic.getScriptTagArgs = function() {
	var scripts = document.getElementsByTagName('script');
	var index = scripts.length - 1;
	var this_script = scripts[index];
	var params = { };

	if (this_script.src.match(/\?/)) {
		this_script.src.replace(/(?:.*\?)?(?:([^=]+)(?:=([^&]*))?&?)/g, function () {
			function decode(s) {
				return decodeURIComponent(s.split("+").join(" "));
			}

			params[decode(arguments[1])] = decode(arguments[2]);
		});
	}

	return params;
};

/**
 * Actually makes the widget and appends it to the DOM.
 * @param {Object} data the JSON object returned by sactraffic.org.
 */
SacTraffic.updateWidget = function(data) {
	var doc = document;
	var widget = doc.getElementById('sactraffic_widget');
	var ul = widget.getElementsByTagName('ul')[0];

	while (ul.hasChildNodes()) {ul.removeChild(ul.firstChild);}

	for (var x = 0, xl = data.length; x < xl && x < SacTraffic.showNum; x++) {
		var incident = data[x];
		var logtime = new Date(incident.LogTimeEpoch * 1000);
		var li = doc.createElement('li');

		var template = '<a href="http://www.sactraffic.org/incident?id={ID}">{LogType}, {Location}</a> <span class="time">{time}</span>';

		li.innerHTML = template.supplant({time: logtime.ago(), ID: incident.ID, LogType: incident.LogType, Location: incident.Location});

		// tag the last li in the ul in case we want to style it
		if (x == xl - 1 || x == SacTraffic.showNum - 1)
			li.className = "last";

		ul.appendChild(li);
	}
}

/**
 * Updates the CHP data from SacTraffic.org.
 */
SacTraffic.updateTrafficData = function () {
	SacTraffic.addScriptNode('http://www.sactraffic.org/json?dispatch=STCC&callback=SacTraffic.updateWidget', function () {
		var doc = document;
		var oldScriptNode = doc.getElementById('sactraffic_widget').getElementsByTagName('script')[0];
		if (oldScriptNode)
			oldScriptNode.parentNode.removeChild(oldScriptNode);

		setTimeout(SacTraffic.updateTrafficData, 60000);
	});
};

/**
 * Display the widget.
 */
SacTraffic.init = function () {
	var params = SacTraffic.getScriptTagArgs();

	if (params['style'] != 'none') {
		SacTraffic.addStyleNode('http://www.sactraffic.org/stylesheets/widget.min.css');

		if (params['style']) {
			var doc = document;
			doc.getElementById('sactraffic_widget').className = params['style'];
		}
	}

	if (params['num'])
		SacTraffic.showNum = params['num'];

	SacTraffic.updateTrafficData();
}

SacTraffic.init();
