/**
 * @fileoverview Contains code defining the IncidentList class.
 * @requires jQuery
 */

/**
 * Creates a list of CHP Incidents from CHP Incident data.
 * @class Represents a set of CHP Incidents.
 * @param {Array} data An array of CHP Incidents from SacTraffic.org.
 */
var IncidentList = function (element) {
  this.element = element;
  this.incidents = {};
};

/**
 * Gets an Incident by it's CHP ID.
 * @param {String} id The Incident's CHP ID.
 * @returns {Incident}
 */
IncidentList.prototype.getIncident = function(id) {
  return this.incidents[id];
};

IncidentList.prototype.addIncident = function (incident) {
  var event_name = (typeof this.incidents[incident.ID] === 'undefined') ? 'st_new_incident' : 'st_update_incident';

  this.incidents[incident.ID] = incident;
  $(this).trigger(event_name, [incident]);
};

IncidentList.prototype.removeIncident = function (id) {
  delete this.incidents[id];
  $(this).trigger('st_delete_incident', [id]);
};

IncidentList.prototype.containsId = function (id) {
  return (Object.keys(this.incidents).indexOf(id) === -1) ? false : true;
};

IncidentList.prototype.size = function () {
  var size = 0;
  for (var incident_id in this.incidents) {
    size++;
  }
  return size;
};

IncidentList.prototype.getBounds = function () {
  var lats = [];
  var lons = [];

  for (var incident_id in this.incidents) {
    var incident = this.incidents[incident_id];

    if (incident.geolocation) {
      lats.push(incident.geolocation.lat);
      lons.push(incident.geolocation.lon);
    }
  }

  return {
    sw: {
      lat: lats.min(),
      lon: lons.min()
    },
    ne: {
      lat: lats.max(),
      lon: lons.max()
    }
  };
};

IncidentList.prototype.update = function (incident_data) {
  var update_ids = [];

  // Incidents arrive in decending chronological order. Reverse them so we
  // can prepend them in the DOM.
  incident_data.reverse();

  // Add or update existing incidents
  for (var x = 0; x < incident_data.length; x++) {
    var incident = new Incident(incident_data[x]);

    // Skip Silver and Amber Alerts...
    var alert_re = /(SILVER|AMBER) Alert/i;
    if (alert_re.test(incident.LogType)) continue;

    update_ids.push(incident.ID);
    this.addIncident(incident);
  }

  // Remove incidents we no longer have
  for (var id in this.incidents) {
    if (update_ids.indexOf(id) === -1) {
      this.removeIncident(id);
    }
  }
};
