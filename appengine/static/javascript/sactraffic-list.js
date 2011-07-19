/**
 * @fileoverview Functions for showing CHP incidents on sactraffic.org
 * @requires jQuery
 */

/**
 * @namespace Namespace encapsulating the traffic list functionality.
 */
var TrafficList = function () {
	var showing_details = {};

	/**
	 * Returns an incident block.
	 * @param {String} id The incident ID to show.
	 * @returns {jQuery}
	 */
	function display_incident (incident) {
		var incident_date = new Date(incident.LogTimeEpoch * 1000);

		var point = (incident.geolocation) ? incident.geolocation : null;
		var details = display_details(incident.LogDetails.details);

		var incident_li = jQuery('<li/>').attr('id', incident.ID).addClass('incident').addClass('vevent').hover(
			function () {
				jQuery(this).find('.more').show();
			},
			function () {
				jQuery(this).find('.more').hide();
			}
		);

		// More button
		jQuery('<div/>').addClass('more').html(">>").toggle(
			function() {
				if (typeof trafficmap != "undefined") {
					jQuery('#detailbox').empty().append(jQuery(this).parent().find('.details').clone());
					jQuery('#detailbox').show().animate({
						width: '250px'
					}, 'fast');
					jQuery(this).html('<<');
					//trafficmap.center_on_id(incident.ID);
				}
			},
			function() {
				if (typeof trafficmap != "undefined") {
					jQuery('#detailbox').animate({
						width: '0'
					}, 'fast', function () { jQuery('#detailbox').hide(); });
					jQuery(this).html('>>');
					//trafficmap.recenter();
				}
			}
		).appendTo(incident_li);

		// The marker icon
		if (point) {
			// Default icon...
			var incident_icon_pos = "-18px 0px";

			if (/Traffic Hazard|Disabled Vehicle/.test(incident.LogType)) {
				// Hazard icon...
				// Note: placeholder, we don't actually have a hazard icon
			} else if (/Collision|Fatality|Hit \& Run/.test(incident.LogType)) {
				// Collision icon...
				incident_icon_pos = "0px 0px";
			}

			jQuery('<div/>').addClass('marker').css('background-position', incident_icon_pos).appendTo(incident_li);
		}

		// Summary...
		jQuery('<div/>').addClass('logtype summary').html(incident.LogType).appendTo(incident_li);

		// Location
		var city = (incident.city) ? incident.city : incident.Area;
		jQuery('<div/>').addClass('location').html(incident.Location + "<br/>" + city).appendTo(incident_li);

		// Time
		jQuery('<div/>').addClass('logtime').html(incident.LogTime).append(
			jQuery('<span/>').addClass('dtstart').html(incident_date.getISO8601())
		).appendTo(incident_li);

		// Add the geo microfoemat
		if (point) {
			jQuery('<div/>').addClass('geo').append(
				jQuery('<span/>').addClass('latitude').html(point.lat)
			).append(
				jQuery('<span/>').addClass('longitude').html(point.lon)
			).appendTo(incident_li);
		}

		// Add the 'show details' button...
		var detail_num = incident.LogDetails.details.length;
		if (detail_num > 0) {
			var detail_message = (detail_num == 1) ? 'show ' + detail_num + ' detail' : 'show ' + detail_num + ' details';
			jQuery('<div/>').html(detail_message).addClass('awesome detail button').click(function () {
				details.slideToggle();
				showing_details[incident.ID] = (showing_details[incident.ID]) ? false : true;
			}).appendTo(incident_li);
		}

		// Add the 'show on map' button
		if (point) {
			jQuery('<a/>').attr('href', "http://maps.google.com/maps?q=" + point.lat + "," + point.lon).html('show on map').addClass('awesome showmap button').appendTo(incident_li);
		}

		// Finally, the details
		details.appendTo(incident_li);

		// Display the details block if it was being displayed before...
		if (showing_details[incident.ID]) {
			details.css('display', 'block');
		}

		return incident_li;
	}

	/**
	 * Returns an incident's detail block.
	 * @param {Details} details A detail object.
	 * @returns {jQuery}
	 */
	function display_details (details) {
		var details_ul = jQuery('<ul/>').addClass('details');

		jQuery.each(details, function(i, detail) {
			jQuery('<li/>').append(
				jQuery('<span/>').addClass('detailtime').html(detail.DetailTime)
			).append(
				jQuery('<span/>').addClass('incidentdetail').html(detail.IncidentDetail.replace(/(\*+.+?\*+)/, '<span class="alert">$1</span>'))
			).appendTo(details_ul);
		});

		return details_ul;
	}

	return {
		/**
		 * Shows a full list of CHP incidents.
		 * @param {Incidents} incidents The incidents object fetched via AJAX.
		 */
		show_incidents: function (incidents) {
			jQuery('.incidents').empty();
			jQuery('#mediainfo').empty();

			jQuery.each(incidents, function(i, incident) {
				if (incident.status != "inactive") {
					if (incident.LogType == "Media Information") {
						if (incident.LogDetails.details.length > 0) {
							display_details(incident.LogDetails.details).appendTo('#mediainfo');
							jQuery('#mediainfo').show();
						}
					} else {
						var incident_ul = (i < 4) ? '#incidents_above' : '#incidents_below';
						var incident_li = display_incident(incident);

						incident_li.appendTo(incident_ul);
					}
				}
			});

			jQuery('.incidents li:last-child').addClass('last');
		},

		/**
		 * Shows a single incident.
		 * @param {Incident} incidents The incidents object fetched via AJAX.
		 * @param {String} id The incident ID to show.
		 * @return {Boolean} Boolean indicating whether the incident exists and is active.
		 */
		show_incident: function (incidents, id) {
			var has_incident = false;

			jQuery('#incidents_above').empty();
			jQuery('#incidents_below').empty();

			jQuery.each(incidents, function(i, incident) {
				if (incident.ID == id) {
					display_incident(incident).appendTo('#incidents_above');
					jQuery('#incidents_above .details').show();
					jQuery('.awesome.detail.button').hide();
				}
			});

			if (incidents.length == 0) {
				jQuery('#incidents_above').append(
					jQuery("<li/>").addClass('noincident').html("The incident you requested does not exist or is no longer active.")
				);
			}
		}
	};
}();
