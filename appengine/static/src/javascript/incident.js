/**
 * @fileoverview Contains code defining the Incident class.
 * @requires jQuery
 */

/**
 * Creates an Incident from CHP Incident data.
 * @class Represents a CHP Incident.
 * @param {Object} data A CHP Incident.
 * @property {String} Area
 * @property {String} ID
 * @property {String} Location
 * @property {String} LocationDesc
 * @property {Object} LogDetails
 * @property {String} LogTime
 * @property {String} LogType
 * @property {String} city
 * @property {Object} geolocation
 * @property {String} status
 */
var Incident = function (data) {
	for (var key in data) {
		this[key] = data[key];
	}
}

/**
 * Makes a standard list item for display.
 * @param {String|jQuery} element An element (a selector, element, HTML string, or jQuery object) to append the listItem to.
 */
Incident.prototype.makeListItem = function (element) {
	var self = this;
	var incident_date = new Date(this.LogTime * 1000);
	var point = (this.geolocation) ? this.geolocation : null;

	var incident_li = jQuery('<li/>').attr('id', this.ID).addClass('incident').addClass('vevent').appendTo(element).click(function () {
	  $(this).find('.details').toggleClass('show');
	});

	// The marker icon
	jQuery('<div/>').addClass('marker').css('background-position', this.getIcon().cssPosition).appendTo(incident_li);

	// Summary...
	jQuery('<div/>').addClass('logtype summary').html(this.LogType).appendTo(incident_li);

	// Location
	jQuery('<div/>').addClass('location').html(this.Location).appendTo(incident_li);

	// City
	var city = (this.city) ? this.city : this.Area;
	jQuery('<div/>').addClass('city').html(city).appendTo(incident_li);

	// Time
	jQuery('<div/>').addClass('logtime').html(incident_date.getPrettyDateTime()).append(
		jQuery('<span/>').addClass('dtstart').html(incident_date.getISO8601())
	).appendTo(incident_li);

	// Add the geo microfoemat
	if (point) {
		jQuery('<div/>').addClass('geo').append(
			jQuery('<span/>').addClass('latitude').html(point.lat)
		).append(
			jQuery('<span/>').addClass('longitude').html(point.lon)
		).appendTo(incident_li);
	}

	// Add details
	var details_ul = jQuery('<ul/>').addClass('details').appendTo(incident_li);
	for (var x = 0; x < this.LogDetails.details.length; x++) {
		var detail = this.LogDetails.details[x];

		var detail_li = jQuery('<li/>').addClass('detail').appendTo(details_ul);
		jQuery('<span/>').addClass('detailtime').html(detail.DetailTime.replace(/.*\d\d\d\d\s+/, '') + ": ").appendTo(detail_li);
		jQuery('<span/>').addClass('incidentdetail').html(detail.IncidentDetail).appendTo(detail_li);
	}

	if (this.LogDetails.details.length === 0) {
		jQuery('<div/>').addClass('details').html('No details.').replaceAll(details_ul);
	}
};

/**
 * Returns icon information based on the Incident type.
 * @returns {Object}
 */
Incident.prototype.getIcon = function () {
	var name;
	var cssPosition;

	if (/Fire/.test(this.LogType)) {
		name = "Fire";
		cssPosition = "-128px 0px";
	} else if (/Maintenance|Construction/.test(this.LogType)) {
		name = 'Maintenance';
		cssPosition = "-32px 0px";
	} else if (/Ambulance Enroute|Fatality/.test(this.LogType)) {
		name = 'Collision-serious';
		cssPosition = "-64px 0px";
	} else if (/Collision/.test(this.LogType)) {
		name = 'Collision';
		cssPosition = "-96px 0px";
	} else {
		name = "Hazard";
		cssPosition = "0px 0px";
	}

	return {
		name: name,
		cssPosition: cssPosition
	};
};
