/**
 * @fileoverview Contains code defining the TrafficMap class.
 * @requires Google Maps API
 * @requires jQuery
 */

/**
 * Creates a new traffic map.
 * @class Represents a traffic map.
 * @param {String} elementId An ID to load the map into.
 */
function TrafficMap (elementId) {
	this.center = new google.maps.LatLng(38.56, -121.40);
	this.live_cams = [];
	this.traffic_overlay = null;
	this.marker_list = {};
	this.cameraInfoWindow = new google.maps.InfoWindow();

	// Set up the map icons
	this.default_icon = new google.maps.MarkerImage('/images/map_markers.png',
		new google.maps.Size(18, 18),
		new google.maps.Point(18, 0),
		new google.maps.Point(9, 9));

	this.accident_icon = new google.maps.MarkerImage('/images/map_markers.png',
		new google.maps.Size(18, 18),
		new google.maps.Point(0, 0),
		new google.maps.Point(9, 9));

	this.default_icon_shadow = new google.maps.MarkerImage('/images/map_markers.png',
		new google.maps.Size(23, 23),
		new google.maps.Point(60, 0),
		new google.maps.Point(9, 9));

	var sactrafficMapStyle = [
		{
			featureType: "landscape",
			elementType: "all",
			stylers: [
				{ lightness: 100 }
			]
		},
		{
			featureType: "road.highway",
			elementType: "geometry",
			stylers: [
				{ hue: "#ff0000" },
				{ saturation: -25 }
			]
		},
		{
			featureType: "road.arterial",
			elementType: "geometry",
			stylers: [
				{ saturation: -100 },
				{ visibility: "simplified" }
			]
		},
		{
			featureType: "road.arterial",
			elementType: "labels",
			stylers: [
				{ saturation: -100 },
				{ lightness: 10 }
			]
		}
	];
	var sactrafficMapType = new google.maps.StyledMapType(sactrafficMapStyle, {name: "SacTraffic"});

	var mapOptions = {
		zoom: 11,
		center: this.center,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		streetViewControl: false,
		mapTypeControl: false,
		scrollwheel: false,
		navigationControlOptions: {
			style: google.maps.NavigationControlStyle.SMALL
		}
	};

	this.gmap = new google.maps.Map(document.getElementById(elementId), mapOptions);
	this.gmap.mapTypes.set('sactraffic', sactrafficMapType);
	this.gmap.setMapTypeId('sactraffic');

	// Save the map's center after a user drag...
	var self = this;
	google.maps.event.addListener(this.gmap, "dragend", function() {
		self.center = self.gmap.getCenter();
	});

	this.gmap.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(this.make_traffic_button());
	this.gmap.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(this.make_camera_button());
}

/**
 * Makes a show/hide traffic button to enable/disable the traffic overlay
 * on the map.
 * @returns {DOMelement}
 */
TrafficMap.prototype.make_traffic_button = function () {
	var self = this;
	var div = document.createElement('div');
	div.style.paddingBottom = "2px";
	div.style.paddingTop = "2px";

	jQuery('<div/>').html("Show Traffic").click(function () {
		if (jQuery(this).html() == "Hide Traffic") {
			self.hide_gtraffic();
			jQuery(this).html("Show Traffic");
		} else {
			self.show_gtraffic();
			jQuery(this).html("Hide Traffic");
		}
	}).addClass('awesome blue').appendTo(div);

	return div;
};

/**
 * Makes a show/hide camera button to enable/disable the live camera markers
 * on the map.
 * @returns {DOMelement}
 */
TrafficMap.prototype.make_camera_button = function () {
	var self = this;
	var div = document.createElement('div');
	div.style.paddingBottom = "2px";
	div.style.paddingTop = "2px";

	jQuery('<div/>').html("Hide Cameras").click(function () {
		if (jQuery(this).html() == "Hide Cameras") {
			self.hide_live_cams();
			jQuery(this).html("Show Cameras");
		} else {
			self.show_live_cams();
			jQuery(this).html("Hide Cameras");
		}
	}).addClass('awesome blue').appendTo(div);

	return div;
};

/**
 * Update incident data.
 * @param {Incidents} incidents The incidents object fetched via AJAX.
 */
TrafficMap.prototype.update = function (incidents) {
	this.hide_incidents();
	this.marker_list = {};

	for (var x = 0, xl = incidents.length; x < xl; x++) {
		var incident = incidents.getIncident(x);

		if (incident.status != "inactive" && incident.geolocation && incident.LogType != "Media Information") {
			var marker = this.make_marker(incident);
			this.marker_list[incident.ID] = marker;
		}
	}
};

/**
 * Show a single incident on the map.
 * @param {Incidents} incidents The incidents object fetched via AJAX.
 * @param {String} incident_id The incident ID to show.
 */
TrafficMap.prototype.show_incident = function (incidents, incident_id) {
	for (var x = 0, xl = incidents.length; x < xl; x++) {
		var incident = incidents[x];
		if (incident.ID == incident_id) {
			if (incident.geolocation) {
				var marker = this.make_marker(incident);
				this.center = marker.getPosition();
				this.recenter();
				this.gmap.setZoom(13);
			}
			break;
		}
	}
};

/**
 * Shows the live cams.
 */
TrafficMap.prototype.show_live_cams = function () {
	if (this.live_cams.length === 0) {
		var self = this;

		jQuery.ajax({
			url: "/cameras.txt",
			dataType: "text",
			success: function (cameras) {
				var camera_icon = new google.maps.MarkerImage("/images/map_markers.png",
					new google.maps.Size(24, 24),
					new google.maps.Point(36, 0),
					new google.maps.Point(12, 12));

				var rows = cameras.split(/\n/);
				for (var x = 1, xl = rows.length; x < xl; x++) {
					if (rows[x] === '' || rows[x].match(/^#/)) {
						continue;
					}

					var fields = rows[x].split(/,/);
					var camera = {
						id: fields[0],
						name: fields[1],
						url: fields[2],
						location: {
							lat: fields[3],
							lon: fields[4]
						},
						size: {
							width: fields[5],
							height: fields[6]
						}
					};

					self.live_cams.push(make_camera_marker(camera));
				}

				function make_camera_marker (camera) {
					var marker = new google.maps.Marker({
						position: new google.maps.LatLng(camera.location.lat, camera.location.lon),
						icon: camera_icon,
						title: camera.name,
						map: self.gmap
					});

					google.maps.event.addListener(marker, 'click', function() {
						self.cameraInfoWindow.setContent('<div class="camera_marker"><div class="name">Video: ' + camera.name + '</div><a href="' + camera.url + '">' + camera.url + '</a></div>');
						self.cameraInfoWindow.open(self.gmap, marker);
					});

					return marker;
				}

			}
		});
	} else {
		for (var x = 0, xl = this.live_cams.length; x < xl; x++) {
			var cam_marker = this.live_cams[x];
			cam_marker.setMap(this.gmap);
		}
	}
};

/**
 * Hides the live cams.
 */
TrafficMap.prototype.hide_live_cams = function () {
	for (var x = 0, xl = this.live_cams.length; x < xl; x++) {
		var cam_marker = this.live_cams[x];
		cam_marker.setMap(null);
	}
};

/**
 * Shows Google traffic info.
 */
TrafficMap.prototype.show_gtraffic = function () {
	this.traffic_overlay = new google.maps.TrafficLayer();
	this.traffic_overlay.setMap(this.gmap);
};

/**
 * Hides Google traffic info.
 */
TrafficMap.prototype.hide_gtraffic = function () {
	if (this.traffic_overlay)
		this.traffic_overlay.setMap(null);
};

/**
 * Centers the map on the given incident ID.
 * @param {String} incident_id The incident ID to center on.
 */
TrafficMap.prototype.center_on_id = function (incident_id) {
	if (this.marker_list[incident_id]) {
		this.gmap.panTo(this.marker_list[incident_id].getPosition());
	}
};

/**
 * Recenters the map on the saved center.
 */
TrafficMap.prototype.recenter = function () {
	this.gmap.panTo(this.center);
};

TrafficMap.prototype.centerOnGeo = function (lat, lon) {
	this.gmap.panTo(new google.maps.LatLng(lat, lon));
};

/**
 * Hides the CHP incidents.
 */
TrafficMap.prototype.hide_incidents = function () {
	for (var id in this.marker_list) {
		var marker = this.marker_list[id];
		marker.setMap(null);
	}
};

/**
 * Makes a GMarker for a given incident.
 * @param {Incident} incident The incident.
 * @returns {GMarker}
 */
TrafficMap.prototype.make_marker = function (incident) {
	var self = this;
	var icon = this.default_icon;

	if (/Traffic Hazard|Disabled Vehicle/.test(incident.LogType)) {
		// Hazard icon...
		// Note: placeholder, we don't actually have a hazard icon
	} else if (/Collision|Fatality|Hit \& Run/.test(incident.LogType)) {
		// Collision icon...
		icon = this.accident_icon;
	}

	var marker = new google.maps.Marker({
		position: new google.maps.LatLng(incident.geolocation.lat, incident.geolocation.lon),
		icon: icon,
		shadow: this.default_icon_shadow,
		title: incident.LogType,
		map: this.gmap
	});

	var infowindow = new google.maps.InfoWindow({
		content: '<div class="marker"><div class="logtype">' + incident.LogType + '</div><div class="location">' + incident.Location + '</div><div class="logtime">' + incident.LogTime + '</div></div>'
	});

	google.maps.event.addListener(marker, 'click', function() {
		infowindow.open(self.gmap, marker);
	});

	return marker;
};
