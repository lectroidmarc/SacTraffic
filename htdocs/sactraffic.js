/*
 * $Id: sactraffic.js,v 1.42 2008/11/23 04:44:09 marcm Exp $
 */

var map = null;
var map_center = null;
var map_zoom = null;
var traffic_overlay = null;
var camera_overlay = null;
var camera_markers = new Array();
var showing_details = new Object();
var traffic_icons = new Object();

function get_incidents () {
	var dispatch = "STCC-STCC";
//	$.getJSON("http://www.sactraffic.org/jsonp.php?dispatch=" + dispatch + "&callback=?", update_stuff);
	$.getJSON("/json/" + dispatch + ".json", update_stuff);
}

function update_stuff (incidents) {
	build_incident_list(incidents);
	update_google_map(incidents);
}

function build_incident_list (incidents) {
	$('.incidents').empty();
	$('#mediainfo').empty();

	$.each(incidents, function(i, incident) {
		if (incident.LogType == "Media Information") {
			if (incident.LogDetails.details.length > 0) {
				display_details(incident.LogDetails.details).appendTo('#mediainfo');
				$('#mediainfo').show();
			}
		} else {
			var incident_ul = (i < 4) ? '#incidents_above' : '#incidents_below';
			var incident_li = display_incident(incident);

			incident_li.appendTo(incident_ul);
		}
	});

	$('.incidents li:last-child').addClass('last');
};

function display_incident (incident) {
	var incident_date = new Date(incident.LogTimeEpoch * 1000);

	var latlng = get_location(incident);
	var show_speed = (incident.LogDetails.details.length > 1) ? "slow" : "fast";
	var detail_message = (incident.LogDetails.details.length > 0) ? 'Click for incident details (' + incident.LogDetails.details.length + ')' : '';
	var details = display_details(incident.LogDetails.details);
	if (showing_details[incident.ID]) details.show();

	var incident_li = $('<li/>').attr('id', incident.ID).attr('title', detail_message).addClass('vevent').append(
		$('<span/>').addClass('logtype summary').html(incident.LogType)
	).append(
		$('<br/>')
	).append(
		$('<span/>').addClass('location').html(incident.Location + "<br/>" + incident.Area)
	).append(
		$('<button/>').html('Show on map').click(
			function () {
				$(this).parent().click();
				location = "http://maps.google.com/maps?q=" + latlng.toUrlValue();
			}
		)
	).append(
		$('<br/>')
	).append(
		$('<span/>').addClass('logtime').html(incident.LogTime)
	).append(
		$('<span/>').addClass('dtstart').html(incident_date.getISO8601())
	).append(
		details
	).hover(
		function () {
			if (map && latlng) map.panTo(latlng);
		},
		function () {
			if (map && latlng) map.panTo(map_center)
		}
	).click(function () {
		if (incident.LogDetails.details.length > 0) {
			details.toggle(show_speed);
			showing_details[incident.ID] = (showing_details[incident.ID]) ? false : true;
		}
	});

	if (latlng) {
		var icon = get_icon(incident.LogType);
		$('<img/>')
			.attr('src', icon.image)
			.attr('height', icon.iconSize.height)
			.attr('width', icon.iconSize.width)
			.prependTo(incident_li);

		$('<span/>').addClass('geo').append(
			$('<span/>').addClass('latitude').html(latlng.lat())
		).append(
			$('<span/>').addClass('longitude').html(latlng.lng())
		).appendTo(incident_li)
	}

	return incident_li;
}

function display_details (details) {
	var details_ul = $('<ul/>').addClass('details');

	$.each(details, function(i, detail) {
		$('<li/>').append(
			$('<span/>').addClass('detailtime').html(detail.DetailTime)
		).append(
			$('<span/>').addClass('incidentdetail').html(detail.IncidentDetail.replace(/(\*.+?\*)/, '<span class="alert">$1</span>'))
		).appendTo(details_ul);
	});

	return details_ul;
}


function update_google_map (incidents) {
	if (!map) init_map();

	if (map) {
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
	
		$.each(incidents, function(i, incident) {
			var latlng = get_location(incident);
			if (latlng && incident.LogType != "Media Information") {
				var marker = new GMarker(latlng, {
					icon: get_icon(incident.LogType),
					zIndexProcess: function () {
						// Put the incidents *under* everything else
						return GOverlay.getZIndex(latlng.lat()) * 2;
					}
				});
	
				GEvent.addListener(marker, "click", function() {
					marker.openInfoWindowHtml(
						'<div class="marker"><span class="logtype">' + incident.LogType + '</span><br/><span class="location">' + incident.Location + '</span><br/><span class="logtime">' + incident.LogTime + '</span></div>'
					);
				});
	
				map.addOverlay(marker);
			}
		});
	}
}

function init_map () {
	// Don't init the map if the right column is hidden (iPhone)
	if (!google.maps || $("#rightcol").css('display') == 'none') return;

	map = new GMap2(document.getElementById("map"));

	GEvent.addListener(map, "load", function() {
		$(".traffic").fadeIn("slow");
		$("input.traffic").attr('checked', 'checked');

		get_cameras();
	});

	// defaults
	if (map_center == null)
		map_center = new GLatLng(38.56, -121.40);
	if (map_zoom == null)
		map_zoom = 10;

	map.setCenter(map_center, map_zoom);
	map.addControl(new GSmallMapControl());

	GEvent.addListener(map, "dragend", function() {
		map_center = map.getCenter();
	});

	$("span.traffic").click(function () {
		$("input.traffic").click();
	});

	$("input.traffic").click(function () {
		if ($("input.traffic").attr('checked')) {
			traffic_overlay = new GTrafficOverlay({incidents:true});
			map.addOverlay(traffic_overlay);
		} else {
			map.removeOverlay(traffic_overlay);
		}
	});

	$(window).unload( function () { GUnload(); } );
}

function get_cameras () {
	$.ajax({
		url: "../cameras.xml",
		dataType: "xml",
		success: function (cameras) {
			var camera_icon = new GIcon();
			camera_icon.image = "/images/camera_icon.gif";
			camera_icon.iconSize = new GSize(24, 24);
			camera_icon.iconAnchor = new GPoint(12, 12);
			camera_icon.infoWindowAnchor = new GPoint(12, 1);

			$(cameras).find('camera').each(function() {
				var id = $(this).attr('id');
				var name = $(this).attr('name');
				var lon = $(this).find('location').attr('lon');
				var lat = $(this).find('location').attr('lat');
				var height = $(this).find('size').attr('height');
				var width = $(this).find('size').attr('width');

				var marker = new GMarker(new GPoint(lon, lat), { title:name, icon:camera_icon });

				GEvent.addListener(marker, "click", function() {
					var ie_safe_name = name.replace(/ /g, "_").replace(/-/g, "_");
					var window_width = parseInt(width) + 60;
					var window_height = parseInt(height) + 170;

					window.open("../showcamera.php?id="+id, ie_safe_name, "width="+window_width+",height="+window_height);
				});

				camera_markers.push(marker);
			});

			$(".live_cams").fadeIn("slow");
			$("input.live_cams").attr('checked', '');

			$("span.live_cams").click(function () {
				$("input.live_cams").click();
			});

			$("input.live_cams").click(function () {
				if (camera_overlay) {
					$(camera_markers).each(function () {
						map.removeOverlay(this);
					});
					camera_overlay = null;
				} else {
					$(camera_markers).each(function () {
						map.addOverlay(this);
					});
					camera_overlay = 1;
				}
			});

			$("input.live_cams").click();	// show the cameras
		}
	});
}

function get_icon (logtype) {
	if (traffic_icons.defaultIcon == undefined) init_icons();

	if (/Traffic Hazard|Disabled Vehicle/.test(logtype))
		return traffic_icons.hazardIcon;
	else if (/Collision/.test(logtype))
		return traffic_icons.collisionIcon;
	else
		return traffic_icons.defaultIcon;
}

function init_icons () {
	traffic_icons.defaultIcon = new GIcon(G_DEFAULT_ICON);
	traffic_icons.defaultIcon.image = "images/incident.png";
	traffic_icons.defaultIcon.shadow = "images/traffic_incident_shadow.png";
	traffic_icons.defaultIcon.iconSize = new GSize(18, 18);
	traffic_icons.defaultIcon.shadowSize = new GSize(23, 23);
	traffic_icons.defaultIcon.iconAnchor = new GPoint(9, 9);
	traffic_icons.defaultIcon.infoWindowAnchor = new GPoint(8, 3)
	
	traffic_icons.hazardIcon = new GIcon(traffic_icons.defaultIcon);
	
	traffic_icons.collisionIcon = new GIcon(traffic_icons.defaultIcon);
	traffic_icons.collisionIcon.image = "images/accident.png";
}

function get_location (incident) {
	if (google.maps && incident.TBXY && incident.TBXY != "") {
		var point = tbxy2latlng(incident.TBXY);
		return new GLatLng(point.lat, point.lng);
	} else if (google.maps && incident.GeoCode) {
		var point = incident.GeoCode.split(", ");
		return new GLatLng(point[0], point[1]);
	}

	return null;
}

function tbxy2latlng (tbxy) {
	var tb = tbxy.split(/:/);

	var lat = tb[1] * 0.00000274 +  33.172;
 	var lng = tb[0] * 0.0000035  - 144.966;

	return { "lat": lat, "lng": lng }
}


Date.prototype.getISO8601 = function () {
	var month = (this.getMonth() + 1 < 10) ? "0" + this.getMonth() + 1 : this.getMonth() + 1;
	var day = (this.getDate() < 10) ? "0" + this.getDate() : this.getDate();
	var hours = (this.getHours() < 10) ? "0" + this.getHours() : this.getHours();
	var minutes = (this.getMinutes() < 10) ? "0" + this.getMinutes() : this.getMinutes();
	var seconds = (this.getSeconds() < 10) ? "0" + this.getSeconds() : this.getSeconds();

	var offset = this.getTimezoneOffset() / 60;

	return this.getFullYear() + "-" + month + "-" + day + "T" + hours + ":" + minutes + ":" + seconds + "-0" + offset + "00";
};

// vim: ts=4