/**
 * @fileoverview Base functions and globals for sactraffic.org
 * @requires jQuery
 */

/** Global variable for the traffic map.  Allows other elements to interact with it if it's defined. */
var trafficmap;

/**
 * Setup code for the index page.
 */
function init_index (id) {
	if (screen.width > 480) {
		trafficmap = new TrafficMap("map");
		trafficmap.show_live_cams();
		//trafficmap.show_gtraffic();

		//TrafficNews.show("#sactraffic_news", "http://www.lectroid.net/category/sactrafficorg/feed/", 7);
	}

	get_incidents(id);
}

/**
 * Fetches the incident JSON and processes it accordingly.
 */
function get_incidents (id) {
	var incidentId = (typeof (id) !== 'undefined') ? id : "";

	jQuery.getJSON("/json?dispatch=SACC&id=" + incidentId, function (data) {
		var incidents = new IncidentList(data);
		incidents.makeList(jQuery('#leftcol'));

		if (typeof trafficmap !== 'undefined') {
			trafficmap.update(incidents);
		}

		if (incidents.length > 1 || incidents.getIncident(0).status != 'inactive') {
			setTimeout(get_incidents, 60000, id);
		}
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
