/*
 * $Id: sactraffic-single.js,v 1.1 2008/11/11 05:40:08 marcm Exp $
 */

function get_incident (id) {
	var dispatch = "STCC-STCC";
	if (!id) return;
	$.getJSON("/json/" + dispatch + ".json", function (incidents) {
		show_incident(incidents, id);
	});
}

function show_incident (incidents, id) {
	var has_incident = false;
	$('#incidents_above').empty();

	$.each(incidents, function(i, incident) {
		if (incident.ID == id) {
			document.title += ": " + incident.LogType;
			$('#header h1').html(incident.LogType);
			display_incident(incident).appendTo('#incidents_above');
			$('#incidents_above .details').show();
			plot_incident(incident);
			setTimeout('get_incident("'+id+'")', 60000);
			has_incident = true;
		}
	});

	if (!has_incident) $('#incidents_above').append(
		$("<b/>").html("The incident you requested does not exist or is no longer active.")
	);
}

function plot_incident (incident) {
	map.clearOverlays();

	// Put stuff back on the map that should be there
	if (camera_overlay)
		$(camera_markers).each(function () {
			map.addOverlay(this);
		});

	if ($("input.traffic").attr('checked')) {
		traffic_overlay = new GTrafficOverlay({incidents:true});
		map.addOverlay(traffic_overlay);
	}

	var latlng = get_location(incident);
	if (latlng) {
		var icon = get_icon(incident.LogType);
		var marker = new GMarker(latlng, { icon:icon });
		map_center = latlng

		GEvent.addListener(marker, "click", function() {
			marker.openInfoWindowHtml(
				'<div class="marker"><span class="logtype">' + incident.LogType + '</span><br/><span class="location">' + incident.Location + '</span><br/><span class="logtime">' + incident.LogTime + '</span></div>'
			);
		});

		map.addOverlay(marker);
		map.panTo(latlng);
	}
}

function get_query (arg) {
	var query = window.location.search.substring(1);
	var params = query.split('&');

	for (var i = 0; i < params.length; i++) {
		var param = params[i].split('=');
		if (param[0] == arg)
			return param[1];
	}
}

// vim: ts=4