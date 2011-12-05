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
 * @property {Object} LogDetails
 * @property {String} LogTime
 * @property {Number} LogTimeEpoch
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
	var incident_date = new Date(this.LogTimeEpoch * 1000);
	var point = (this.geolocation) ? this.geolocation : null;

	var li = jQuery('<li/>').attr('id', this.ID).addClass('incident').addClass('vevent').appendTo(element);

	this.moreButton = jQuery('<div/>').addClass('more').click(function () {
		if (jQuery(this).hasClass('opened')) {
			self.hideDetailBox();
		} else {
			self.showDetailBox();
		}
	}).mousedown(function () {
		jQuery(this).addClass('mousedown');
	}).mouseup(function () {
		jQuery(this).removeClass('mousedown');
	}).appendTo(li);


	// The marker icon
	jQuery('<div/>').addClass('marker').css('background-position', this.getIcon().cssPosition).appendTo(li);

	// Summary...
	jQuery('<div/>').addClass('logtype summary').html(this.LogType).appendTo(li);

	// Location
	var city = (this.city) ? this.city : this.Area;
	jQuery('<div/>').addClass('location').html(this.Location + "<br/>" + city).appendTo(li);

	// Time
	jQuery('<div/>').addClass('logtime').html(incident_date.getPrettyDateTime()).append(
		jQuery('<span/>').addClass('dtstart').html(incident_date.getISO8601())
	).appendTo(li);

	// Add the geo microfoemat
	if (point) {
		jQuery('<div/>').addClass('geo').append(
			jQuery('<span/>').addClass('latitude').html(point.lat)
		).append(
			jQuery('<span/>').addClass('longitude').html(point.lon)
		).appendTo(li);
	}
};

/**
 * Shows a "detail box" populated with the incident's details.
 */
Incident.prototype.showDetailBox = function () {
	var detailBox = jQuery('#detailbox');
	var content = jQuery('#detailbox .content').empty();
	var geolocation = this.geolocation;

	// Close box
	jQuery('#detailbox .closebox').unbind('click').click(this.hideDetailBox);
	// Show on Map button
	jQuery('#detailbox .showonmap').unbind('click').click(function () {
		if (trafficmap) {
			trafficmap.centerOnGeo(geolocation.lat, geolocation.lon);
		}
	});

	jQuery('<div/>').addClass('incidentID').html(this.ID).appendTo(content);
	jQuery('<div/>').addClass('logtype').html(this.LogType).appendTo(content);
	var city = (this.city) ? this.city : this.Area;
	jQuery('<div/>').addClass('location').html(this.Location + "<br/>" + city).appendTo(content);

	var ul = jQuery('<ul/>').addClass('details').appendTo(content);
	for (var x = 0; x < this.LogDetails.details.length; x++) {
		var detail = this.LogDetails.details[x];

		var li = jQuery('<li/>').addClass('detail').appendTo(ul);
		jQuery('<span/>').addClass('detailtime').html(detail.DetailTime.replace(/.*\d\d\d\d\s+/, '') + ": ").appendTo(li);
		jQuery('<span/>').addClass('incidentdetail').html(detail.IncidentDetail).appendTo(li);
	}

	if (this.LogDetails.details.length === 0) {
		jQuery('<div/>').addClass('details').html('No details.').replaceAll(ul);
	}

	// "Close" any opened detailbox buttons
	jQuery('.opened').removeClass('opened');
	this.moreButton.addClass('opened');

	detailBox.show().animate({
		width: '40%',
		'min-width': '300px'
	}, 'fast');
};

/**
 * Hides a "detail box" populated with the incident's details.
 */
Incident.prototype.hideDetailBox = function () {
	var detailBox = jQuery('#detailbox');

	detailBox.animate({
		width: '0',
		'min-width': '0'
	}, 'fast', function () {
		detailBox.hide();
		jQuery('#detailbox .content').empty();
		// "Close" any opened detailbox buttons
		jQuery('.opened').removeClass('opened');
	});
};

/**
 * Returns icon information based on the Incident type.
 * @returns {Object}
 */
Incident.prototype.getIcon = function () {
	var name;
	var cssPosition;

	if (/Traffic Hazard|Disabled Vehicle/.test(this.LogType)) {
		name = "Hazard";
		cssPosition = "-18px 0px";
	} else if (/Collision|Fatality|Hit \& Run/.test(this.LogType)) {
		name = "Collision";
		cssPosition = "0px 0px";
	} else if (/Fire/.test(this.LogType)) {
		name = "Fire";
		cssPosition = "-18px 0px";
	} else if (/Ped/.test(this.LogType)) {
		name = "Pedestrian";
		cssPosition = "-18px 0px";
	} else {
		name = "Hazard";
		cssPosition = "-18px 0px";
	}

	return {
		name: name,
		cssPosition: cssPosition
	};
};
