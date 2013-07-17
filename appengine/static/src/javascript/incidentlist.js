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
 * Gets an Incident by it's ID.
 * @param {String} id The Incident's ID.
 * @returns {Incident}
 */
IncidentList.prototype.getIncident = function(id) {
  return this.incidents[id];
};

/**
 * Add an Incident to the IncidentList.
 * @param {Incident} incident The Incident to add.
 * @fires IncidentList#st_new_incident
 * @fires IncidentList#st_update_incident
 */
IncidentList.prototype.addIncident = function (incident) {
  if (typeof this.incidents[incident.ID] === 'undefined') {
    /**
     * A new Incident event.
     * @event IncidentList#st_new_incident
     * @param {Incident} incident The incident created.
     */
    $(this).trigger('st_new_incident', [incident]);
  } else {
    /**
     * An updated Incident event.
     * @event IncidentList#st_update_incident
     * @param {Incident} incident The incident updated.
     */
    $(this).trigger('st_update_incident', [incident]);
  }

  this.incidents[incident.ID] = incident;
};

/**
 * Remove an Incident from the IncidentList.
 * @param {String} id The Incident id to remove.
 * @fires IncidentList#st_delete_incident
 */
IncidentList.prototype.removeIncident = function (id) {
  delete this.incidents[id];

  /**
   * An Incident delete event.
   * @event IncidentList#st_delete_incident
   * @param {String} id The incident ID deleted.
   */
  $(this).trigger('st_delete_incident', [id]);
};

/**
 * Test is a given ID is in the IncidentList.
 * @param {String} id The Incident id to remove.
 * @returns {boolean}
 */
IncidentList.prototype.containsId = function (id) {
  return (Object.keys(this.incidents).indexOf(id) === -1) ? false : true;
};

/**
 * Returns the number of incidents in the IncidentList.
 * @returns {number}
 */
IncidentList.prototype.size = function () {
  var size = 0;
  for (var incident_id in this.incidents) {
    size++;
  }
  return size;
};

/**
 * Gets the bounds of the Incidents in the IncidentList.
 * @returns {Object}
 */
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

/**
 * Udpates the IncidentList with new data from the server.
 * @param {Object} incident_data the server data.
 */
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
