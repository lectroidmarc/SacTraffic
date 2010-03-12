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
			trafficmap.load_live_cams("/cameras.xml");
			trafficmap.show_gtraffic();

			jQuery("span.traffic").click(function () {
				jQuery("input.traffic").click();
			});
			jQuery("input.traffic").click(function () {
				if (jQuery("input.traffic").attr('checked')) {
					trafficmap.show_gtraffic();
				} else {
					trafficmap.hide_gtraffic();
				}
			});
			jQuery(".traffic").show();

			jQuery("span.live_cams").click(function () {
				jQuery("input.live_cams").click();
			});
			jQuery("input.live_cams").click(function () {
				if (jQuery("input.live_cams").attr('checked')) {
					trafficmap.show_live_cams();
				} else {
					trafficmap.hide_live_cams();
				}
			});
			jQuery(".live_cams").show();

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

		jQuery.getJSON("/json/STCC-STCC.json", function (incidents) {
			var incident_exists = TrafficList.show_incident(incidents, id);

			if (typeof trafficmap != "undefined") {
				trafficmap.gmap.zoomIn();
				trafficmap.show_incident(incidents, id);
			}

			if (incident_exists) {
				setInterval(function () {
					jQuery.getJSON("/json/STCC-STCC.json", function (incidents) {
						TrafficList.show_incident(incidents, id);
					});
				}, 10000);
			}
		});
	});
}
window['init_incident'] = init_incident;	// Closure-style export: http://code.google.com/closure/compiler/docs/api-tutorial3.html#export

/**
 * Fetches the incident JSON and processes it accordingly.
 */
function get_incidents (map) {
	jQuery.getJSON("/json/STCC-STCC.json", function (incidents) {
		TrafficList.show_incidents(incidents);

		if (typeof map != "undefined") { map.update(incidents); }

		setTimeout(get_incidents, 60000, map);
	});
}

/**
 * Converts the CHP "TBXY" type coordinated to latitude and longitude.
 * @param {String} tbxy_str The TBXY data from the CHP feed.
 * @returns {Object}
 */
function tbxy2latlng (tbxy_str) {
	var tbxy = tbxy_str.split(/:/);

	var lat = tbxy[1] * 0.00000274 +  33.172;
	var lng = tbxy[0] * 0.0000035  - 144.966;

	return { "lat": lat, "lng": lng };
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
