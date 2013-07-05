/**
 * @fileoverview Base functions and globals for sactraffic.org.
 * @requires jQuery
 */

/**
 * Global variable for the traffic map.
 * Allows other elements to interact with it if it's defined.
 */
var trafficmap;

/**
 * Setup code for the index page.
 */
var init_index = function () {
	if (screen.width > 480) {
		trafficmap = new TrafficMap('map', { live_cams: true });

		//TrafficNews.show("#sactraffic_news", "http://www.lectroid.net/category/sactrafficorg/feed/", 7);
	}

	get_incidents(RequestArgs.get('id'));
}

/**
 * Fetches the incident JSON and processes it accordingly.
 */
var get_incidents = function (id) {
	jQuery.getJSON('/json?dispatch=SACC&active_only=1', function (data) {
		var incidents = new IncidentList(data);
		incidents.makeList('incidents');

		// Refresh the detail box if it's open, fallback to the id param
		var detailboxId = jQuery('#detailbox .incidentID').html();
		if (detailboxId) {
			// See if the incident is still active, if it is refresh it,
			// if not, close it.
			var detailBoxIncident = incidents.getIncidentById(detailboxId);
			if (typeof(detailBoxIncident) === 'undefined') {
				incidents.getIncident(0).hideDetailBox();
			} else {
				incidents.getIncidentById(detailboxId).showDetailBox();
			}
		} else if (typeof (id) !== 'undefined') {
			incidents.getIncidentById(id).showDetailBox();
		}

		if (typeof trafficmap !== 'undefined') {
			trafficmap.update(incidents);
		}

		setTimeout(get_incidents, 60000);
	});
}

window.addEventListener('resize', function () {
  if (typeof trafficmap !== "undefined") {
    trafficmap.resize();
  }
});
