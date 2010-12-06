/**
 * @fileoverview Encapsulates the TrafficMap class.
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
}

/**
 * Update incident data.
 * @param {Incidents} incidents The incidents object fetched via AJAX.
 */
TrafficMap.prototype.update = function (incidents) {
	this.hide_incidents();
	this.marker_list = {};

	for (var x = 0, xl = incidents.length; x < xl; x++) {
		var incident = incidents[x];

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
	if (this.live_cams.length == 0) {
		var self = this;

		jQuery.ajax({
			url: "/getcameras",
			dataType: "json",
			success: function (cameras) {
				var camera_icon = new google.maps.MarkerImage("/images/map_markers.png",
					new google.maps.Size(24, 24),
					new google.maps.Point(36, 0),
					new google.maps.Point(12, 12));

				for (var x = 0, xl = cameras.length; x < xl; x++) {
					self.live_cams.push(make_camera_marker(cameras[x]));
				}

				function make_camera_marker (camera) {
					var marker = new google.maps.Marker({
						position: new google.maps.LatLng(camera.location.lat, camera.location.lon),
						icon: camera_icon,
						title: camera.name,
						map: self.gmap
					});

					google.maps.event.addListener(marker, 'click', function() {
						var ie_safe_name = camera.name.replace(/ /g, "_").replace(/-/g, "_");
						var window_width = parseInt(camera.size.width) + 60;
						var window_height = parseInt(camera.size.height) + 170;

						window.open("/showcamera?id="+camera.id, ie_safe_name, "width="+window_width+",height="+window_height);
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
