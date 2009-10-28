/**
 * @fileoverview Functions for showing CHP incidents on sactraffic.org
 * @requires jQuery
 */

/**
 * Placeholder for saving the state of opened/closed incidents
 */
var showing_details = new Object();

/**
 * Shows a single incident.
 * @param {Incident} incidents The incidents object fetched via AJAX.
 * @param {String} id The incident ID to show.
 */
function show_incident (incidents, id) {
	var has_incident = false;
	jQuery('#incidents_above').empty();
	jQuery('#incidents_below').hide();

	jQuery.each(incidents, function(i, incident) {
		if (incident.ID == id) {
			document.title += ": " + incident.LogType;
			jQuery('#header h1').html(incident.LogType);
			display_incident(incident).appendTo('#incidents_above');
			jQuery('#incidents_above .details').show();
			
			has_incident = true;
		}
	});

	if (!has_incident) jQuery('#incidents_above').append(
		jQuery("<b/>").html("The incident you requested does not exist or is no longer active.")
	);
}

/**
 * Shows a full list of CHP incidents.
 * @param {Incidents} incidents The incidents object fetched via AJAX.
 */
function build_incident_list (incidents) {
	jQuery('.incidents').empty();
	jQuery('#mediainfo').empty();

	jQuery.each(incidents, function(i, incident) {
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
	});

	jQuery('.incidents li:last-child').addClass('last');
};

/**
 * Returns an incident block.
 * @param {String} id The incident ID to show.
 * @returns {jQuery}
 */
function display_incident (incident) {
	var incident_date = new Date(incident.LogTimeEpoch * 1000);

	var point = (incident.TBXY && incident.TBXY != "") ? tbxy2latlng(incident.TBXY) : null;
	var show_speed = (incident.LogDetails.details.length > 1) ? "slow" : "fast";
	var detail_message = (incident.LogDetails.details.length > 0) ? 'Click for incident details (' + incident.LogDetails.details.length + ')' : '';
	var details = display_details(incident.LogDetails.details);

	var incident_li = jQuery('<li/>').attr('id', incident.ID).attr('title', detail_message).addClass('vevent').append(
		jQuery('<div/>').addClass('logtype summary').html(incident.LogType)
	).append(
		jQuery('<div/>').addClass('location').html(incident.Location + "<br/>" + incident.Area).append(
			jQuery('<button/>').html('Show on map').click(
				function () {
					if (point) {
						jQuery(this).parent().click();
						location = "http://maps.google.com/maps?q=" + point.lat + "," + point.lng;
					}
				}
			)
		)
	).append(
		jQuery('<div/>').addClass('logtime').html(incident.LogTime).append(
			jQuery('<span/>').addClass('dtstart').html(incident_date.getISO8601())
		)
	).append(
		details
	).hover(
		function () {
			if (typeof trafficmap != "undefined") trafficmap.center_on_id(incident.ID);
		},
		function () {
			if (typeof trafficmap != "undefined") trafficmap.recenter();
		}
	).click(function () {
		if (incident.LogDetails.details.length > 0) {
			details.toggle(show_speed);
			showing_details[incident.ID] = (showing_details[incident.ID]) ? false : true;
		}
	});

	// Display the details block if it was being displayed before...
	if (showing_details[incident.ID]) {
		details.css('display', 'block');
	}

	if (point) {
		var incident_icon = "/images/incident.png";
		if (/Traffic Hazard|Disabled Vehicle/.test(incident.LogType))
			incident_icon = "/images/incident.png";
		else if (/Collision/.test(incident.LogType))
			incident_icon = "/images/accident.png";
		
		jQuery('<img/>')
			.attr('src', incident_icon)
			.attr('height', '18')
			.attr('width', '18')
			.prependTo(incident_li);

		// Add the geo microfoemat
		jQuery('<div/>').addClass('geo').append(
			jQuery('<span/>').addClass('latitude').html(point.lat)
		).append(
			jQuery('<span/>').addClass('longitude').html(point.lng)
		).appendTo(incident_li)
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
			jQuery('<span/>').addClass('incidentdetail').html(detail.IncidentDetail.replace(/(\*.+?\*)/, '<span class="alert">$1</span>'))
		).appendTo(details_ul);
	});

	return details_ul;
}