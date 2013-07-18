/**
 * @fileoverview Contains code defining the TrafficMap class.
 * @requires GoogleMaps
 * @requires jQuery
 */

if (typeof google !== 'undefined' && typeof google.maps !== 'undefined')
  google.maps.visualRefresh = true;

/**
 * Creates a new traffic map.
 * @class Represents a traffic map.
 * @this TrafficMap
 * @param {String} elementId An ID to load the map into.
 * @param {IncidentList} incidents An IncidentList to link to the map.
 */
var TrafficMap = function (elementId, incidents) {
  var self = this;

  this._live_cams = [];
  this._traffic_overlay = null;
  this._incidents = incidents;
  this._markers = {};
  this._icons = {};
  this._globalInfoWindow = new google.maps.InfoWindow();
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
  google.maps.event.addListener(this.gmap, 'tilesloaded', function() {
    $('#incident_container').slideDown(function () {
      $('#incident_container .header .closebox').click(function () { $('#incident_container').toggleClass('closed'); });
    });
  });
  google.maps.event.addListener(this._globalInfoWindow, 'closeclick', function() {
    self.resize();
  });

  $(this._incidents).on('st_new_incident', function (evt, incident) {
    self.addIncident(incident);
  });
  $(this._incidents).on('st_update_incident', function (evt, incident) {
    self.addIncident(incident);
  });
  $(this._incidents).on('st_delete_incident', function (evt, id) {
    self.removeIncident(id);
  });
}

/**
 * Makes a show/hide traffic button to enable/disable the traffic overlay
 * on the map.
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
 * Moves the map to cover the all the incidents.
 */
TrafficMap.prototype.fitIncidents = function () {
  if (this._incidents.size() > 0 && !this._map_has_been_moved) {
    var bounds = this._incidents.getBounds();
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
            icon: self.getMapIcon('camera'),
            title: camera.name,
            map: self.gmap
          });

          google.maps.event.addListener(marker, 'click', function() {
            self._globalInfoWindow.setContent('<div class="camera marker"><div class="name">Live Video: ' + camera.name + '</div><div class="button blue" onclick="window.open(\'' +  camera.url + '\')">Show</div>');
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
 * Centers the map on the given latitude and longitude.
 * @param {Number} lat The latitude.
 * @param {Number} lon The longitude.
 */
TrafficMap.prototype.centerOnGeo = function (lat, lon) {
  this.gmap.panTo(new google.maps.LatLng(lat, lon));
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

  return this._mapstate[key] || false;
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
 * Adds a Marker for a given incident.
 * @param {Incident} incident The incident.
 */
TrafficMap.prototype.addIncident = function (incident) {
  var self = this;

  if (!incident.geolocation) return;

  var icon = this.getMapIcon(incident.getIcon().name);
  var marker = this._markers[incident.ID];
  if (typeof(marker) === 'undefined') {
    marker = new google.maps.Marker({
      position: new google.maps.LatLng(incident.geolocation.lat, incident.geolocation.lon),
      icon: icon,
      shadow: this.getMapIcon('shadow'),
      title: incident.LogType,
      map: this.gmap
    });

    this._markers[incident.ID] = marker;
    this.fitIncidents();
  } else {
    // Update the icon, incase it's changed.
    marker.setIcon(icon);
    marker.setTitle(incident.LogType);
    google.maps.event.clearListeners(marker, 'click');
  }

  google.maps.event.addListener(marker, 'click', function() {
    var logtime = new Date(incident.LogTime * 1000);
    self._globalInfoWindow.setContent('<div class="marker"><div class="logtype">' + incident.LogType + '</div><div class="location">' + incident.Location + '</div><div class="logtime">' + logtime.getPrettyDateTime() + '</div></div>');
    self._globalInfoWindow.open(self.gmap, marker);
  });
};

/**
 * Removes a Marker for a given incident.
 * @param {String} id The incident ID to remove.
 */
TrafficMap.prototype.removeIncident = function (id) {
  this._markers[id].setMap(null);
  delete this._markers[id];
  this.fitIncidents();
};

/**
 * Icon generator for the traffic map.
 * @param {String} type The type of icon to return.
 */
TrafficMap.prototype.getMapIcon = function (type) {
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
      case 'Maintenance':
        origin = new google.maps.Point(32, 0);
        break;
      case 'Collision-serious':
        origin = new google.maps.Point(64, 0);
        break;
      case 'Collision':
        origin = new google.maps.Point(96, 0);
        break;
      case 'Fire':
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

    this._icons[type] = {
      anchor: anchor,
      origin: origin,
      scaledSize: scaledSize,
      size: size,
      url: url
    };
  }

  return this._icons[type];
}
