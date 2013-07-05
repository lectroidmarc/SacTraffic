/**
 * @fileoverview Contains code defining the IncidentList class.
 * @requires jQuery
 */

/**
 * Creates a list of CHP Incidents from CHP Incident data.
 * @class Represents a set of CHP Incidents.
 * @param {Array} data An array of CHP Incidents from SacTraffic.org.
 */
var IncidentList = function (data) {
	this._incidents = {};
	this._bounds = {};

	this.update(data);
};

/**
 * Gets an Incident by it's CHP ID.
 * @param {String} id The Incident's CHP ID.
 * @returns {Incident}
 */
IncidentList.prototype.getIncidentById = function(id) {
	return this._incidents[id];
};

IncidentList.prototype.getIncidents = function() {
	return this._incidents;
};

IncidentList.prototype.getIncidents = function() {
	return this._incidents;
};

IncidentList.prototype.addIncident = function (incident) {
	if (typeof this._incidents[incident.ID] === 'undefined' || !this._incidents[incident.ID].compare(incident)) {
		this._incidents[incident.ID] = incident;
	}
};

IncidentList.prototype.delIncident = function (incident) {
	delete this._incidents[incident.ID];
};

IncidentList.prototype.size = function () {
	var size = 0;
	for (var incident_id in this.getIncidents()) {
		size++;
	}
	return size;
};

IncidentList.prototype.update = function (data) {
	var lats = [];
	var lons = [];
	var new_data_ids = [];

	// Add or update existing incidents
	for (var x = 0; x < data.length; x++) {
		var incident = new Incident(data[x]);
		new_data_ids.push(incident.ID);

		if (incident.geolocation) {
			lats.push(incident.geolocation.lat);
			lons.push(incident.geolocation.lon);
		}

		this.addIncident(incident);
	}

	this._bounds = {
		sw: {
			lat: lats.min(),
			lon: lons.min()
		},
		ne: {
			lat: lats.max(),
			lon: lons.max()
		}
	};

	// Remove incidents we no longer have
	for (var id in this.getIncidents()) {
		var incident = this.getIncidentById(id);
		if (new_data_ids.indexOf(incident.ID) === -1) {
			this.delIncident(incident);
		}
	}
};

/**
 * Get the bounding box of the incidents.
 * @returns {Object}
 */
IncidentList.prototype.getBounds = function() {
	return this._bounds;
};

/**
 * Makes a standard unordered list for the display of Incidents.
 * @param {String|jQuery} element An element (a selector, element, HTML string, or jQuery object) to append the unordered list to.
 */
IncidentList.prototype.makeList = function (element) {
	element.empty();
	var ul = jQuery('<ul/>').addClass('incidents').appendTo(element);

	for (var id in this._incidents) {
		var incident = this.getIncidentById(id);

		// TODO: Media info?

		incident.makeListItem(ul);
	}
};
