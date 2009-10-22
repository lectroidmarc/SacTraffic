/**
 * @fileoverview Encapsulates the TrafficMap class.
 * @requires Google Maps API
 * @requires jQuery
 */

/**
 * Creates a new Traffic Map.
 * @constructor
 * @param {String} elementId An ID to load the map into.
 */
function TrafficMap (elementId) {
	var self = this;
	
	var center = new GLatLng(38.56, -121.40);
	var zoom = 10;
	
	/** The encapsulated Google Map. */
	this.gmap = new GMap2(document.getElementById(elementId));
	this.gmap.setCenter(center, zoom);
	this.gmap.addControl(new GSmallMapControl());
	
	/** The map center. */
	this.center = center;
	
	// Save the map's center after a user drag...
	GEvent.addListener(this.gmap, "dragend", function() {
		self.center = self.gmap.getCenter();
	});
	
	/** Array of live cameras, loaded by {@link load_live_cams}. */
	this.live_cams = [];
	
	/** Named array of incident markers by ID. */
	this.marker_list = {};
	
	/** 
	 * Loads live cam data from an XML file.
	 * @param {String} cam_url The url of the camera xml file.
	 */
	this.load_live_cams = function (cam_url) {
		jQuery.ajax({
			url: cam_url,
			dataType: "xml",
			success: function (cameras) {
				var camera_markers = [];
				
				var camera_icon = new GIcon();
				camera_icon.image = "/images/camera_icon.gif";
				camera_icon.iconSize = new GSize(24, 24);
				camera_icon.iconAnchor = new GPoint(12, 12);
				camera_icon.infoWindowAnchor = new GPoint(12, 1);
				
				for (var x = 0; x < cameras.getElementsByTagName("camera").length; x++) {
					var camera = cameras.getElementsByTagName("camera")[x];
					var marker = make_marker (camera);
							
					camera_markers.push(marker);
				}
				
				self.live_cams = camera_markers;
				jQuery(".live_cams").fadeIn("slow");
				
				// Closure needed to make marker GEvents work right
				function make_marker (camera_dom_node) {
					var id = camera.getAttribute("id");
 					var name = camera.getAttribute("name");
 					var lon = camera.getElementsByTagName("location")[0].getAttribute("lon");
 					var lat = camera.getElementsByTagName("location")[0].getAttribute("lat");
 					var height = camera.getElementsByTagName("size")[0].getAttribute("height");
 					var width = camera.getElementsByTagName("size")[0].getAttribute("width");

					var marker = new GMarker(new GPoint(lon, lat), { title:name, icon:camera_icon });
		
					GEvent.addListener(marker, "click", function() {
						var ie_safe_name = name.replace(/ /g, "_").replace(/-/g, "_");
						var window_width = parseInt(width) + 60;
						var window_height = parseInt(height) + 170;
		
						window.open("../showcamera.php?id="+id, ie_safe_name, "width="+window_width+",height="+window_height);
					});
					
					return marker;
				}
			}
		});
	}
	
	/**
	 * Shows the live cams.
	 */
	this.show_live_cams = function () {
		for (var x = 0; x < this.live_cams.length; x++) {
			this.gmap.addOverlay(this.live_cams[x]);
		}
	}
	
	/**
	 * Hides the live cams.
	 */
	this.hide_live_cams = function () {
		for (var x = 0; x < this.live_cams.length; x++) {
			this.gmap.removeOverlay(this.live_cams[x]);
		}
	}

	/**
	 * Shows Google traffic info.
	 */
	this.show_gtraffic = function () {
		/** The Google traffic overlay. */
		this.traffic_overlay = new GTrafficOverlay({incidents:true});
		this.gmap.addOverlay(this.traffic_overlay);
	}
	
	/**
	 * Hides Google traffic info.
	 */
	this.hide_gtraffic = function () {
		this.gmap.removeOverlay(this.traffic_overlay);
	}
	
	/**
	 * Centers the map on the given incident ID.
	 * @param {String} incident_id The incident ID to center on.
	 */
	this.center_on_id = function (incident_id) {
		if (this.marker_list[incident_id]) {
			this.gmap.panTo(this.marker_list[incident_id].getLatLng());
		}
	}
	
	/**
	 * Recenters the map on the saved center
	 */
	this.recenter = function () {
		this.gmap.panTo(this.center);
	}
	
	/**
	 * Update incident data.
	 * @param {object} incidents The incidents object fetched via AJAX.
	 */
	this.update = function (incidents) {
		this.marker_list = {};
		this.gmap.clearOverlays();
		
		// Put stuff back on the map that should be there
		if (jQuery("input.live_cams").attr('checked')) {
			this.show_live_cams();
		}
		if (jQuery("input.traffic").attr('checked')) {
			this.show_gtraffic();
		}
		
		for (var x = 0; x < incidents.length; x++) {
			var incident = incidents[x];
			var marker = make_marker (incident);
			
			if (marker) {
				this.marker_list[incident.ID] = marker;
				this.gmap.addOverlay(marker);
			}
		};
		
		// Closure needed to make marker GEvents work right
		function make_marker (incident) {
			if (incident.TBXY && incident.TBXY != "") {
				var point = tbxy2latlng(incident.TBXY);
				var latlng = new GLatLng(point.lat, point.lng);
				
				if (incident.LogType != "Media Information") {
					var incident_icon = ST_DEFAULT_ICON;
					
					if (/Traffic Hazard|Disabled Vehicle/.test(incident.LogType))
						incident_icon = ST_HAZARD_ICON;
					else if (/Collision/.test(incident.LogType))
						incident_icon = ST_COLLISION_ICON;
		
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
							'<div class="marker"><span class="logtype">' + incident.LogType + '</span><br/><span class="location">' + incident.Location + '</span><br/><span class="logtime">' + incident.LogTime + '</span></div>'
						);
					});
					
					return marker;
				}
			}
		}
	};
	
	jQuery(window).unload( function () { GUnload(); } );
}

/** Default incident icon. */
var ST_DEFAULT_ICON = new GIcon(G_DEFAULT_ICON);
ST_DEFAULT_ICON.image = "/images/incident.png";
ST_DEFAULT_ICON.shadow = "/images/traffic_incident_shadow.png";
ST_DEFAULT_ICON.iconSize = new GSize(18, 18);
ST_DEFAULT_ICON.shadowSize = new GSize(23, 23);
ST_DEFAULT_ICON.iconAnchor = new GPoint(9, 9);
ST_DEFAULT_ICON.infoWindowAnchor = new GPoint(8, 3);

/** Default hazard icon. */
var ST_HAZARD_ICON = new GIcon(ST_DEFAULT_ICON);

/** Default collision icon. */
var ST_COLLISION_ICON = new GIcon(ST_DEFAULT_ICON);
ST_COLLISION_ICON.image = "/images/accident.png";
