/**
 * Creates a list of CHP Incidents from CHP Incident data.
 * @class Represents a set of CHP Incidents.
 * @param {Array} data An array of CHP Incidents from SacTraffic.org.
 * @property {Number} length The number of Incidents in the list.
 */
var IncidentList = function (data) {
	this.length = data.length;
	this._incidents = [];
	this._index = {};

	for (var x = 0; x < data.length; x++) {
		var incident = new Incident(data[x]);

		this._incidents.push(incident);
		this._index[incident.ID] = x;
	}
};

/**
 * @fileoverview Contains code defining the IncidentList class.
 * @requires jQuery
 */

/**
 * Gets an Incident by it's index number.
 * @param {Number} index The Incident's index in the IncidentList.
 * @returns {Incident}
 */
IncidentList.prototype.getIncident = function(index) {
	return this._incidents[index];
};

/**
 * Gets an Incident by it's CHP ID.
 * @param {String} id The Incident's CHP ID.
 * @returns {Incident}
 */
IncidentList.prototype.getIncidentById = function(id) {
	return this._incidents[this._index[id]];
};

/**
 * Makes a standard unordered list for the display of Incidents.
 * @param {String|jQuery} element An element (a selector, element, HTML string, or jQuery object) to append the unordered list to.
 */
IncidentList.prototype.makeList = function (element) {
	element.empty();
	var ul = jQuery('<ul/>').addClass('incidents').appendTo(element);

	for (var x = 0; x < this.length; x++) {
		var incident = this.getIncident(x);

		// TODO: Media info?

		if (incident.status !== 'inactive') {
			incident.makeListItem(ul);
		}
	}
};
