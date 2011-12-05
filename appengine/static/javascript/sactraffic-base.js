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
		incidents.makeList(jQuery('#incidentlist'));

		// Handle the detail box if it's open
		var detailboxId = jQuery('#detailbox .incidentID').html();
		if (detailboxId) {
			var detailBoxIncident = incidents.getIncidentById(detailboxId);
			if (typeof(detailBoxIncident) === 'undefined') {
				incidents.getIncident(0).hideDetailBox();
			} else {
				incidents.getIncidentById(detailboxId).showDetailBox();
			}
		}

		if (typeof trafficmap !== 'undefined') {
			trafficmap.update(incidents);
		}

		if (incidents.length > 0 && (incidents.length > 1 || incidents.getIncident(0).status != 'inactive')) {
			setTimeout(get_incidents, 60000, id);
		}
	});
}

/**
 * Provides an ISO 8601 datetime format to the Date object.
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

/**
 * Provides a "pretty" time-only format to the Date object.
 *
 * Like: 7:12 PM
 */
Date.prototype.getPrettyTime = function () {
	var minutes = (this.getMinutes() < 10) ? "0" + this.getMinutes() : this.getMinutes();
	var hours = this.getHours();
	var ampm = "AM";

	if (hours > 12) {
		ampm = "PM";
		hours -= 12;
	} else if (hours == 0) {
		hours = "12";
	}

	return hours + ":" + minutes + " " + ampm;
}

/**
 * Provides a "pretty" datetime format to the Date object.
 *
 * Like: 12/04/2011 7:12 PM
 */
Date.prototype.getPrettyDateTime = function () {
	var month = this.getMonth() + 1;
	var day = (this.getDate() < 10) ? "0" + this.getDate() : this.getDate();

	return month + "/" + day + "/" + this.getFullYear() + " " + this.getPrettyTime();
}
