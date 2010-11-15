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
	var self = this;

	var map_style = [
		{
			featureType: 'road',
			elementType: 'geometry',
			stylers: [{'visibility': 'simplified'}]
		},
		{
			featureType: 'road.arterial',
			stylers: [
				{hue: 149},
				{saturation: -78},
				{lightness: 0}
			]
		},
		{
			featureType: 'road.highway',
			stylers: [
				{hue: -31},
				{saturation: -40},
				{lightness: 2.8}
			]
		},
		{
			featureType: 'poi',
			elementType: 'label',
			stylers: [{'visibility': 'off'}]
		},
		{
			featureType: 'landscape',
			stylers: [
				{hue: 163},
				{saturation: -26},
				{lightness: -1.1}
			]
		},
		{
			featureType: 'transit',
			stylers: [{'visibility': 'off'}]
		},
		{
			featureType: 'water',
			stylers: [
				{hue: 3},
				{saturation: -24.24},
				{lightness: -38.57}
			]
		}
	];
	var sactrafficMapType = new google.maps.StyledMapType(map_style, {name: "SacTraffic"});

	this.center = new google.maps.LatLng(38.56, -121.40);
	this.live_cams = [];
	this.traffic_overlay = null;
	this.marker_list = {};

	var mapOptions = {
		zoom: 10,
		center: this.center,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		streetViewControl: false,
		mapTypeControl: false
	};

	this.gmap = new google.maps.Map(document.getElementById(elementId), mapOptions);
	this.gmap.mapTypes.set('sactraffic', sactrafficMapType);
	this.gmap.setMapTypeId('sactraffic');

	// Set up the map icons
	this.default_icon = new google.maps.MarkerImage('/images/incident.png',
		new google.maps.Size(18, 18),
		new google.maps.Point(0,0),
		new google.maps.Point(9,9));

	this.accident_icon = new google.maps.MarkerImage('/images/accident.png',
		new google.maps.Size(18, 18),
		new google.maps.Point(0,0),
		new google.maps.Point(9,9));

	this.default_icon_shadow = new google.maps.MarkerImage('/images/traffic_incident_shadow.png',
		new google.maps.Size(23, 23),
		new google.maps.Point(0,0),
		new google.maps.Point(9,9));

	// Save the map's center after a user drag...
	google.maps.event.addListener(this.gmap, "dragend", function() {
		self.center = self.gmap.getCenter();
	});
}

/**
 * Loads live cam data from an XML file.
 * @param {String} cam_url The url of the camera xml file.
 */
TrafficMap.prototype.load_live_cams = function (cam_url) {
	var self = this;

	jQuery.ajax({
		url: cam_url,
		dataType: "json",
		success: function (cameras) {
			var camera_icon = new google.maps.MarkerImage("/images/camera_icon.gif",
				new google.maps.Size(24, 24),
				new google.maps.Point(0,0),
				new google.maps.Point(12, 12));

			for (var x = 0; x < cameras.length; x++) {
				var camera = cameras[x];
				var marker = new google.maps.Marker({
					position: new google.maps.LatLng(camera.location.lat, camera.location.lon),
					icon: camera_icon,
					title: camera.name
				});

				google.maps.event.addListener(marker, 'click', function() {
					var ie_safe_name = camera.name.replace(/ /g, "_").replace(/-/g, "_");
					var window_width = parseInt(camera.size.width) + 60;
					var window_height = parseInt(camera.size.height) + 170;

					window.open("/showcamera?id="+camera.id, ie_safe_name, "width="+window_width+",height="+window_height);
				});

				self.live_cams.push(marker);
			}

			// Show the live cams by default
			self.show_live_cams();
		}
	});
};

/**
 * Update incident data.
 * @param {Incidents} incidents The incidents object fetched via AJAX.
 */
TrafficMap.prototype.update = function (incidents) {
	this.hide_incidents();
	this.marker_list = {};

	for (var x = 0; x < incidents.length; x++) {
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
	for (var x = 0; x < incidents.length; x++) {
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
	for (var x = 0; x < this.live_cams.length; x++) {
		var cam_marker = this.live_cams[x];
		cam_marker.setMap(this.gmap);
	}
};

/**
 * Hides the live cams.
 */
TrafficMap.prototype.hide_live_cams = function () {
	for (var x = 0; x < this.live_cams.length; x++) {
		var cam_marker = this.live_cams[x];
		cam_marker.setMap(null);
	}
};

/**
 * Shows Google traffic info.
 */
TrafficMap.prototype.show_gtraffic = function () {
	if (!this.traffic_overlay)
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
