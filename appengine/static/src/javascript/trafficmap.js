/**
 * @fileoverview Contains code defining the TrafficMap class.
 * @requires Google Maps API
 * @requires jQuery
 */

/**
 * Creates a new traffic map.
 * @class Represents a traffic map.
 * @param {String} elementId An ID to load the map into.
 * @param {Object} [defaultState] Default state for the map.
 * @param {Boolean} [defaultState._live_cams] To show the live cameras.
 * @param {Boolean} [defaultState.traffic] To show the traffic overlay.
 */
var TrafficMap = function (elementId, defaultState) {
  var self = this;

  this.loadState(defaultState);
  this._live_cams = [];
  this._traffic_overlay = null;
  this._markers = {};
  this._icons = {};
  this._globalInfoWindow = new google.maps.InfoWindow();
  this.cameraInfoWindow = new google.maps.InfoWindow();
  this._map_has_been_moved = false;

  var mapOptions = {
    zoom: 11,
    center: new google.maps.LatLng(38.56, -121.40),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    scrollwheel: false,
    disableDefaultUI: true
  };

  this.gmap = new google.maps.Map(document.getElementById(elementId), mapOptions);

  // Setup the map buttons.
  this.make_traffic_button();
  this.make_camera_button();
  var recenter_btn = document.getElementById('recenter_btn');
  recenter_btn.onclick = function () {
    this.style.display = 'none';
    self._map_has_been_moved = false;
    self.fitIncidents();
  };

  this.gmap.controls[google.maps.ControlPosition.TOP_RIGHT].push(document.getElementById('mapcontrol'));
  this.gmap.controls[google.maps.ControlPosition.TOP_LEFT].push(document.getElementById('incident_container'));
  $('#incident_container .header .closebox').click(function () { $('#incident_container').toggleClass('closed'); });

  // Set initial map state
  if (this.getState('live_cams')) {
    this.show_live_cams();
  }

  if (this.getState('traffic')) {
    this.show_gtraffic();
  }

  // Events...
  google.maps.event.addListener(this.gmap, 'dragend', function() {
    recenter_btn.style.display = 'block';
    self._map_has_been_moved = true;
  });
  google.maps.event.addListener(this.gmap, 'dblclick', function() {
    recenter_btn.style.display = 'block';
    self._map_has_been_moved = true;
  });
  google.maps.event.addListener(this.gmap, 'resize', function() {
    self.fitIncidents();
  });
  google.maps.event.addListener(this._globalInfoWindow, 'closeclick', function() {
    self.resize();
  });
}

/**
 * Makes a show/hide traffic button to enable/disable the traffic overlay
 * on the map.
 * @returns {DOMelement}
 */
TrafficMap.prototype.make_traffic_button = function () {
  var self = this;

  this.traffic_button = document.getElementById('traffic_btn');
  this.traffic_button.onclick = function () {
    if (self.getState('traffic')) {
      self.hide_gtraffic();
    } else {
      self.show_gtraffic();
    }
  };
};

/**
 * Makes a show/hide camera button to enable/disable the live camera markers
 * on the map.
 * @returns {DOMelement}
 */
TrafficMap.prototype.make_camera_button = function () {
  var self = this;

  this.camera_button = document.getElementById('camera_btn');
  this.camera_button.onclick = function () {
    if (self.getState('live_cams')) {
      self.hide_live_cams();
    } else {
      self.show_live_cams();
    }
  };
};

/**
 * Update incident data.
 * @param {Incidents} incidents The incidents object fetched via AJAX.
 */
TrafficMap.prototype.update = function (incidents) {
  this.incidents = incidents;

  // remove markers for incidents we no longer have
  for (var id in this._markers) {
    if (!this.incidents.containsId(id)) {
      this._markers[id].setMap(null);
      delete this._markers[id];
    }
  }

  for (var id in this.incidents.incidents) {
    var incident = this.incidents.getIncident(id);

    if (incident.geolocation) {
      this._markers[incident.ID] = this.make_marker(incident);
    }
  }

  this.fitIncidents();
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
 * Moves the map to cover the all the incidents.
 */
TrafficMap.prototype.fitIncidents = function () {
  if (typeof(this.incidents) !== 'undefined' && this.incidents.size() > 1 && !this._map_has_been_moved) {
    var bounds = this.incidents.getBounds();
    this.gmap.fitBounds(new google.maps.LatLngBounds(
      new google.maps.LatLng (bounds.sw.lat, bounds.sw.lon),
      new google.maps.LatLng (bounds.ne.lat, bounds.ne.lon)
    ));
  }
};

/**
 * Tells Google to resize.
 */
TrafficMap.prototype.resize = function () {
  google.maps.event.trigger(this.gmap, 'resize');
};

/**
 * Shows the live cams.
 */
TrafficMap.prototype.show_live_cams = function () {
  if (this._live_cams.length === 0) {
    var self = this;

    jQuery.ajax({
      url: "/data/cameras.txt",
      dataType: "text",
      success: function (cameras) {
        var rows = cameras.split(/\n/);
        for (var x = 1, xl = rows.length; x < xl; x++) {
          if (rows[x] === '' || rows[x].match(/^#/)) {
            continue;
          }

          var fields = rows[x].split(/,/);
          var camera = {
            name: fields[0],
            url: fields[1],
            location: {
              lat: fields[2],
              lon: fields[3]
            }
          };

          self._live_cams.push(make_camera_marker(camera));
        }

        function make_camera_marker (camera) {
          var marker = new google.maps.Marker({
            position: new google.maps.LatLng(camera.location.lat, camera.location.lon),
            icon: self.getIcon('camera'),
            title: camera.name,
            map: self.gmap
          });

          google.maps.event.addListener(marker, 'click', function() {
            self._globalInfoWindow.setContent('<div class="camera marker"><div class="name">Live Video</div><div class="button"><div class="button blue" onclick="window.open(\'' +  camera.url + '\')">' + camera.name + '</div></div>');
            self._globalInfoWindow.open(self.gmap, marker);
          });

          return marker;
        }

      }
    });
  } else {
    for (var x = 0, xl = this._live_cams.length; x < xl; x++) {
      var cam_marker = this._live_cams[x];
      cam_marker.setMap(this.gmap);
    }
  }

  this.camera_button.innerHTML = 'Hide Cameras';
  this.setState('live_cams', true);
};

/**
 * Hides the live cams.
 */
TrafficMap.prototype.hide_live_cams = function () {
  for (var x = 0, xl = this._live_cams.length; x < xl; x++) {
    var cam_marker = this._live_cams[x];
    cam_marker.setMap(null);
  }

  this.camera_button.innerHTML = 'Show Cameras';
  this.setState('live_cams', false);
};

/**
 * Shows Google traffic info.
 */
TrafficMap.prototype.show_gtraffic = function () {
  this._traffic_overlay = new google.maps.TrafficLayer();
  this._traffic_overlay.setMap(this.gmap);

  this.traffic_button.innerHTML = 'Hide Traffic';
  this.setState('traffic', true);
};

/**
 * Hides Google traffic info.
 */
TrafficMap.prototype.hide_gtraffic = function () {
  if (this._traffic_overlay) {
    this._traffic_overlay.setMap(null);
  }

  this.traffic_button.innerHTML = 'Show Traffic';
  this.setState('traffic', false);
};

/**
 * Centers the map on the given incident ID.
 * @param {String} incident_id The incident ID to center on.
 */
TrafficMap.prototype.center_on_id = function (incident_id) {
  if (this._markers[incident_id]) {
    this.gmap.panTo(this._markers[incident_id].getPosition());
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
 * Initially loads map state from localSupport, falls back to given defaults.
 * @param {Object} defaultState Default state to use if none saved.
 */
TrafficMap.prototype.loadState = function (defaultState) {
  var state = null;

  // Try localStorage first
  if ('localStorage' in window && window['localStorage'] !== null) {
    state = JSON.parse(localStorage.getItem('trafficmap_state')) || null;
  }

  // If localStorage didn't work try some defaults...
  if (!state && typeof(defaultState) === 'object') {
    state = defaultState;
  }

  this._mapstate = state || {};
};

/**
 * Getter for map state.
 * @param {String} key The key to get.
 * @return {Any} The value.
 */
TrafficMap.prototype.getState = function (key) {
  if (typeof(this._mapstate) === 'undefined') {
    if ('localStorage' in window && window['localStorage'] !== null) {
      this._mapstate = JSON.parse(localStorage.getItem('trafficmap_state')) || {};
    }
  }

  return this._mapstate[key];
};

/**
 * Setter for map state. Also saved to localStorage if possible.
 * @param {String} key The key to set.
 * @param {Any} value The value to set.
 */
TrafficMap.prototype.setState = function (key, value) {
  this._mapstate[key] = value;
  if ('localStorage' in window && window['localStorage'] !== null) {
    localStorage.setItem('trafficmap_state', JSON.stringify(this._mapstate));
  }
};

/**
 * Hides the CHP incidents.
 */
TrafficMap.prototype.hide_incidents = function () {
  for (var id in this._markers) {
    var marker = this._markers[id];
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

  var icon = this.getIcon();
  if (/Fire/.test(incident.LogType)) {
    icon = this.getIcon('fire');
  } else if (/Maintenance|Construction/.test(incident.LogType)) {
    icon = this.getIcon('maintenance');
  } else if (/Ambulance Enroute|Fatality/.test(incident.LogType)) {
    icon = this.getIcon('collision-serious');
  } else if (/Collision/.test(incident.LogType)) {
    icon = this.getIcon('collision');
  }

  var marker = this._markers[incident.ID];
  if (typeof(marker) === 'undefined') {
    marker = new google.maps.Marker({
      position: new google.maps.LatLng(incident.geolocation.lat, incident.geolocation.lon),
      icon: icon,
      shadow: this.getIcon('shadow'),
      title: incident.LogType,
      map: this.gmap
    });
  } else {
    marker.setIcon(icon);
    marker.setTitle(incident.LogType);
    google.maps.event.clearListeners(marker, 'click');
  }

  google.maps.event.addListener(marker, 'click', function() {
    var logtime = new Date(incident.LogTime * 1000);
    self._globalInfoWindow.setContent('<div class="marker"><div class="logtype">' + incident.LogType + '</div><div class="location">' + incident.Location + '</div><div class="logtime">' + logtime.getPrettyDateTime() + '</div></div>');
    self._globalInfoWindow.open(self.gmap, marker);
  });

  return marker;
};

/**
 * Icon generator for the traffic map.
 * @param {String} type The type of icon to return.
 */
TrafficMap.prototype.getIcon = function (type) {
  if (typeof(type) === 'undefined') {
    type = 'generic';
  }

  if (typeof(this._icons[type]) === 'undefined') {
    var url = '/images/map_markers.png?v=3';
    var size = new google.maps.Size(32, 37);
    var origin = new google.maps.Point(0, 0);
    var anchor = new google.maps.Point(16, 37);
    var scaledSize = null;

    switch (type) {
      case 'maintenance':
        origin = new google.maps.Point(32, 0);
        break;
      case 'collision-serious':
        origin = new google.maps.Point(64, 0);
        break;
      case 'collision':
        origin = new google.maps.Point(96, 0);
        break;
      case 'fire':
        origin = new google.maps.Point(128, 0);
        break;
      case 'camera':
        origin = new google.maps.Point(160, 0);
        break;
      case 'shadow':
        size = new google.maps.Size(51, 37);
        origin = new google.maps.Point(0, 37);
        anchor = new google.maps.Point(26, 37);
        break;
    }

    this._icons[type] = new google.maps.MarkerImage(url, size, origin, anchor, scaledSize);
  }

  return this._icons[type];
}
