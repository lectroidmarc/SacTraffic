/**
 * @fileoverview Functions for showing CHP incidents on sactraffic.org
 * @requires jQuery
 */

var showing_details = new Object();

function show_incident (incidents, id) {
	var has_incident = false;
	$('#incidents_above').empty();
	$('#incidents_below').hide();

	$.each(incidents, function(i, incident) {
		if (incident.ID == id) {
			document.title += ": " + incident.LogType;
			$('#header h1').html(incident.LogType);
			display_incident(incident).appendTo('#incidents_above');
			$('#incidents_above .details').show();
			
			has_incident = true;
		}
	});

	if (!has_incident) $('#incidents_above').append(
		$("<b/>").html("The incident you requested does not exist or is no longer active.")
	);
}

function build_incident_list (incidents) {
	jQuery('.incidents').empty();
	jQuery('#mediainfo').empty();

	$.each(incidents, function(i, incident) {
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

function display_incident (incident) {
	var incident_date = new Date(incident.LogTimeEpoch * 1000);

	var point = (incident.TBXY && incident.TBXY != "") ? tbxy2latlng(incident.TBXY) : null;
	var show_speed = (incident.LogDetails.details.length > 1) ? "slow" : "fast";
	var detail_message = (incident.LogDetails.details.length > 0) ? 'Click for incident details (' + incident.LogDetails.details.length + ')' : '';
	var details = display_details(incident.LogDetails.details);
	if (showing_details[incident.ID]) details.show();

	var incident_li = jQuery('<li/>').attr('id', incident.ID).attr('title', detail_message).addClass('vevent').append(
		jQuery('<span/>').addClass('logtype summary').html(incident.LogType)
	).append(
		jQuery('<br/>')
	).append(
		jQuery('<span/>').addClass('location').html(incident.Location + "<br/>" + incident.Area)
	).append(
		jQuery('<button/>').html('Show on map').click(
			function () {
				if (point) {
					jQuery(this).parent().click();
					location = "http://maps.google.com/maps?q=" + point.lat + "," + point.lng;
				}
			}
		)
	).append(
		jQuery('<br/>')
	).append(
		jQuery('<span/>').addClass('logtime').html(incident.LogTime)
	).append(
		jQuery('<span/>').addClass('dtstart').html(incident_date.getISO8601())
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
		jQuery('<span/>').addClass('geo').append(
			jQuery('<span/>').addClass('latitude').html(point.lat)
		).append(
			jQuery('<span/>').addClass('longitude').html(point.lng)
		).appendTo(incident_li)
	}

	return incident_li;
}

function display_details (details) {
	var details_ul = jQuery('<ul/>').addClass('details');

	$.each(details, function(i, detail) {
		jQuery('<li/>').append(
			jQuery('<span/>').addClass('detailtime').html(detail.DetailTime)
		).append(
			jQuery('<span/>').addClass('incidentdetail').html(detail.IncidentDetail.replace(/(\*.+?\*)/, '<span class="alert">$1</span>'))
		).appendTo(details_ul);
	});

	return details_ul;
}
