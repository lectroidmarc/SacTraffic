/**
 * @fileoverview Base functions and globals for sactraffic.org
 * @requires jQuery
 */

/** Global variable for the traffic map.  Allows other elements to interact with it if it's defined. */
var trafficmap;

/**
 * Setup code for the index page.
 */
function init_index () {
	jQuery(document).ready(function() {
		if (screen.width > 480) {
			trafficmap = new TrafficMap("map");
			trafficmap.show_live_cams();
			//trafficmap.show_gtraffic();

			TrafficNews.show("#sactraffic_news", "http://www.lectroid.net/category/sactrafficorg/feed/", 7);
		}

		get_incidents(trafficmap);
	});
}
window['init_index'] = init_index;	// Closure-style export: http://code.google.com/closure/compiler/docs/api-tutorial3.html#export

/**
 * Setup code for the single incident page.
 */
function init_incident (id) {
	jQuery(document).ready(function() {
		if (screen.width > 480) {
			trafficmap = new TrafficMap("map");
		}

		get_incident(trafficmap, id);
	});
}
window['init_incident'] = init_incident;	// Closure-style export: http://code.google.com/closure/compiler/docs/api-tutorial3.html#export

/**
 * Fetches single-incident JSON and processes it accordingly.
 */
function get_incident (map, id) {
	if (id == "") {
		TrafficList.show_incident([], null);
		if (typeof map != "undefined") { map.show_incident(incidents, id); }
	}

	jQuery.getJSON("/json?id=" + id, function (data) {
		var incidents = new IncidentList(data);
		incidents.makeList(jQuery('#leftcol'));

		if (typeof map != "undefined") { map.show_incident(incidents, id); }

		if (incidents.length > 0 && incidents.getIncident(0).status != "inactive") {
			setTimeout(get_incident, 10000, map, id);
		}
	});
}

/**
 * Fetches the incident JSON and processes it accordingly.
 */
function get_incidents (map) {
	jQuery.getJSON("/json?dispatch=SACC", function (data) {
		var incidents = new IncidentList(data);
		incidents.makeList(jQuery('#leftcol'));

		if (typeof map != "undefined") { map.update(incidents); }

		setTimeout(get_incidents, 60000, map);
	});
}

/**
 * Provides an ISO 8601 date formate to the Date object
 */
Date.prototype.getISO8601 = function () {
	var month = (this.getMonth() + 1 < 10) ? "0" + this.getMonth() + 1 : this.getMonth() + 1;
	var day = (this.getDate() < 10) ? "0" + this.getDate() : this.getDate();
	var hours = (this.getHours() < 10) ? "0" + this.getHours() : this.getHours();
	var minutes = (this.getMinutes() < 10) ? "0" + this.getMinutes() : this.getMinutes();
	var seconds = (this.getSeconds() < 10) ? "0" + this.getSeconds() : this.getSeconds();

	var offset = this.getTimezoneOffset() / 60;

	return this.getFullYear() + "-" + month + "-" + day + "T" + hours + ":" + minutes + ":" + seconds + "-0" + offset + "00";
};
