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

	this.center = new GLatLng(38.56, -121.40);
	this.live_cams = [];
	this.traffic_overlay = null;
	this.marker_list = {};

	this.gmap = new GMap2(document.getElementById(elementId));
	this.gmap.setCenter(this.center, 10);
	this.gmap.addControl(new GSmallMapControl());

	// Save the map's center after a user drag...
	GEvent.addListener(this.gmap, "dragend", function() {
		self.center = self.gmap.getCenter();
	});

	// Set this up per:
	// http://code.google.com/apis/maps/documentation/index.html#Memory_Leaks
	// Note: .unload() broken in IE7
	//jQuery(window).unload( function () { GUnload(); } );
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
			var camera_icon = new GIcon();
			camera_icon.image = "/images/camera_icon.gif";
			camera_icon.iconSize = new GSize(24, 24);
			camera_icon.iconAnchor = new GPoint(12, 12);
			camera_icon.infoWindowAnchor = new GPoint(12, 1);

			for (var x = 0; x < cameras.length; x++) {
				var marker = make_marker(cameras[x]);

				self.live_cams.push(marker);
			}

			// Show the live cams by default
			self.show_live_cams();

			// Closure needed to make marker GEvents work right
			function make_marker (camera) {
				var marker = new GMarker(new GPoint(camera.location.lon, camera.location.lat), { title:camera.name, icon:camera_icon });

				GEvent.addListener(marker, "click", function() {
					var ie_safe_name = camera.name.replace(/ /g, "_").replace(/-/g, "_");
					var window_width = parseInt(camera.size.width) + 60;
					var window_height = parseInt(camera.size.height) + 170;

					window.open("../showcamera?id="+camera.id, ie_safe_name, "width="+window_width+",height="+window_height);
				});

				return marker;
			}
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

		if (incident.status != "inactive") {
			var marker = this.make_marker(incident);
			if (marker) {
				this.marker_list[incident.ID] = marker;
				this.gmap.addOverlay(marker);
			}
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
			var marker = this.make_marker(incident);
			if (marker) {
				this.gmap.addOverlay(marker);
				this.center = marker.getLatLng();
				this.gmap.setCenter(this.center , 13);
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
		this.gmap.addOverlay(this.live_cams[x]);
	}
};

/**
 * Hides the live cams.
 */
TrafficMap.prototype.hide_live_cams = function () {
	for (var x = 0; x < this.live_cams.length; x++) {
		this.gmap.removeOverlay(this.live_cams[x]);
	}
};

/**
 * Shows Google traffic info.
 */
TrafficMap.prototype.show_gtraffic = function () {
	this.traffic_overlay = new GTrafficOverlay({incidents:true});
	this.gmap.addOverlay(this.traffic_overlay);
};

/**
 * Hides Google traffic info.
 */
TrafficMap.prototype.hide_gtraffic = function () {
	if (this.traffic_overlay)
		this.gmap.removeOverlay(this.traffic_overlay);
};

/**
 * Centers the map on the given incident ID.
 * @param {String} incident_id The incident ID to center on.
 */
TrafficMap.prototype.center_on_id = function (incident_id) {
	if (this.marker_list[incident_id]) {
		this.gmap.panTo(this.marker_list[incident_id].getLatLng());
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
		this.gmap.removeOverlay(this.marker_list[id]);
	}
};

/**
 * Makes a GMarker for a given incident.
 * @param {Incident} incident The incident.
 * @returns {GMarker}
 */
TrafficMap.prototype.make_marker = function (incident) {
	if (incident.geolocation && incident.LogType != "Media Information") {
		// Default icon...
		var incident_icon = new GIcon(G_DEFAULT_ICON);
		incident_icon.image = "/images/incident.png";
		incident_icon.shadow = "/images/traffic_incident_shadow.png";
		incident_icon.iconSize = new GSize(18, 18);
		incident_icon.shadowSize = new GSize(23, 23);
		incident_icon.iconAnchor = new GPoint(9, 9);
		incident_icon.infoWindowAnchor = new GPoint(8, 3);

		var point = incident.geolocation;
		var latlng = new GLatLng(point.lat, point.lon);

		if (/Traffic Hazard|Disabled Vehicle/.test(incident.LogType)) {
			// Hazard icon...
			// Note: placeholder, we don't actually have a hazard icon
		} else if (/Collision|Fatality|Hit \& Run/.test(incident.LogType)) {
			// Collision icon...
			incident_icon.image = "/images/accident.png";
		}

		var marker = new GMarker(latlng, {
			icon: incident_icon,
			zIndexProcess: function () {
				// Put the CHP incidents *under* everything else because everything
				// else can be turned off to get it out of the way.
				return GOverlay.getZIndex(latlng.lat()) * 2;
			}
		});

		GEvent.addListener(marker, "click", function() {
			marker.openInfoWindowHtml(
				'<div class="marker"><div class="logtype">' + incident.LogType + '</div><div class="location">' + incident.Location + '</div><div class="logtime">' + incident.LogTime + '</div></div>'
			);
		});

		return marker;
	}
};
