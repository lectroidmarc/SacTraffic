/**
 * @fileoverview Base functions and globals for sactraffic.org
 * @requires jQuery
 */


function Incident (data) {
	for (var key in data) {
		this[key] = data[key];
	}
}

Incident.prototype.makeListItem = function (element) {
	var self = this;
	var incident_date = new Date(this.LogTimeEpoch * 1000);
	var point = (this.geolocation) ? this.geolocation : null;

	var more_button = jQuery('<div/>').addClass('more').html(">>").click(function () {
		if (jQuery(this).hasClass('opened')) {
			jQuery(this).removeClass('opened').html('>>');
			self.hideDetailBox(jQuery('#detailbox'));
		} else {
			// Close other opened detailboxs, note: needs more effect
			jQuery('.opened').removeClass('opened').html('>>');
			jQuery(this).addClass('opened').html('<<');
			self.showDetailBox(jQuery('#detailbox'));
		}
	});

	var li = jQuery('<li/>').attr('id', this.ID).addClass('incident').addClass('vevent').append(more_button).hover(
		function () {
			more_button.show();
		},
		function () {
			more_button.hide();
		}
	).appendTo(element);

	// The marker icon
	// Default icon...
	var incident_icon_pos = "-18px 0px";

	if (/Traffic Hazard|Disabled Vehicle/.test(this.LogType)) {
		// Hazard icon...
		// Note: placeholder, we don't actually have a hazard icon
	} else if (/Collision|Fatality|Hit \& Run/.test(this.LogType)) {
		// Collision icon...
		incident_icon_pos = "0px 0px";
	}

	jQuery('<div/>').addClass('marker').css('background-position', incident_icon_pos).appendTo(li);

	// Summary...
	jQuery('<div/>').addClass('logtype summary').html(this.LogType).appendTo(li);

	// Location
	var city = (this.city) ? this.city : this.Area;
	jQuery('<div/>').addClass('location').html(this.Location + "<br/>" + city).appendTo(li);

	// Time
	jQuery('<div/>').addClass('logtime').html(this.LogTime).append(
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
}

Incident.prototype.showDetailBox = function (element) {
	var content = jQuery(element.children('.content')[0]);
	content.empty();

	jQuery('<div/>').html(this.LogType).appendTo(content);
	var ul = jQuery('<ul/>').addClass('details').appendTo(content);
	for (var x = 0; x < this.LogDetails.details.length; x++) {
		var detail = this.LogDetails.details[x];

		jQuery('<li/>').addClass('detail').html(detail.DetailTime.replace(/.*\d\d\d\d\s+/, '') + ": " + detail.IncidentDetail).appendTo(ul);
	}

	element.show().animate({
		width: '35%'
	}, 'fast');
}

Incident.prototype.hideDetailBox = function (element) {
	element.animate({
		width: '0'
	}, 'fast', function () {
		element.hide();
	});
}


function IncidentList (data) {
	this.length = data.length;
	this.incidents = [];
	this.index = {};

	for (var x = 0; x < data.length; x++) {
		var incident = new Incident(data[x]);

		this.incidents.push(incident);
		this.index[incident.ID] = x;
	}
}

IncidentList.prototype.makeList = function (element) {
	var ad_position = 4;
	var count = 0;

	element.empty();
	var ul = jQuery('<ul/>').addClass('incidents').appendTo(element);

	for (var x = 0; x < this.length; x++) {
		var incident = this.getIncident(x);

		if (incident.status !== 'inactive') {
			incident.makeListItem(ul);

			count++;
			if (count < ad_position && x == this.length - 1 || count == ad_position) {
				jQuery('<li/>').attr('id', 'inline_ad').appendTo(ul).append(
					jQuery('<div/>').addClass('ad halfbanner')
				);
			}
		}
	}
}

IncidentList.prototype.getIncident = function(index) {
	return this.incidents[index];
}

IncidentList.prototype.getIncidentById = function(id) {
	return this.incidents[this.index[id]];
}


/** Global variable for the traffic map.  Allows other elements to interact with it if it's defined. */
var trafficmap;

/**
 * Setup code for the index page.
 */
function init_index () {
	jQuery(document).ready(function() {
		if (screen.width > 480) {
			trafficmap = new TrafficMap("map");
			trafficmap.show_live_cams();
			//trafficmap.show_gtraffic();

			jQuery("span.traffic").click(function () {
				jQuery("input.traffic").click();
			});
			jQuery("input.traffic").click(function () {
				if (jQuery("input.traffic").attr('checked')) {
					trafficmap.show_gtraffic();
				} else {
					trafficmap.hide_gtraffic();
				}
			});
			jQuery(".traffic").show();

			jQuery("span.live_cams").click(function () {
				jQuery("input.live_cams").click();
			});
			jQuery("input.live_cams").click(function () {
				if (jQuery("input.live_cams").attr('checked')) {
					trafficmap.show_live_cams();
				} else {
					trafficmap.hide_live_cams();
				}
			});
			jQuery(".live_cams").show();

			TrafficNews.show("#sactraffic_news", "http://www.lectroid.net/category/sactrafficorg/feed/", 7);
		}

		get_incidents(trafficmap);
	});
}
window['init_index'] = init_index;	// Closure-style export: http://code.google.com/closure/compiler/docs/api-tutorial3.html#export

/**
 * Setup code for the single incident page.
 */
function init_incident (id) {
	jQuery(document).ready(function() {
		if (screen.width > 480) {
			trafficmap = new TrafficMap("map");
		}

		get_incident(trafficmap, id);
	});
}
window['init_incident'] = init_incident;	// Closure-style export: http://code.google.com/closure/compiler/docs/api-tutorial3.html#export

/**
 * Fetches single-incident JSON and processes it accordingly.
 */
function get_incident (map, id) {
	if (id == "") {
		TrafficList.show_incident([], null);
		if (typeof map != "undefined") { map.show_incident(incidents, id); }
	}

	jQuery.getJSON("/json?id=" + id, function (incidents) {
		TrafficList.show_incident(incidents, id);

		if (typeof map != "undefined") { map.show_incident(incidents, id); }

		if (incidents.length > 0 && incidents[0].status != "inactive") {
			setTimeout(get_incident, 10000, map, id);
		}
	});
}

/**
 * Fetches the incident JSON and processes it accordingly.
 */
function get_incidents (map) {
	jQuery.getJSON("/json?dispatch=SACC", function (data) {
		var incidents = new IncidentList(data);
		incidents.makeList(jQuery('#leftcol'));

		if (typeof map != "undefined") { map.update(incidents); }

		setTimeout(get_incidents, 60000, map);
	});
}

/**
 * Provides an ISO 8601 date formate to the Date object
 */
Date.prototype.getISO8601 = function () {
	var month = (this.getMonth() + 1 < 10) ? "0" + this.getMonth() + 1 : this.getMonth() + 1;
	var day = (this.getDate() < 10) ? "0" + this.getDate() : this.getDate();
	var hours = (this.getHours() < 10) ? "0" + this.getHours() : this.getHours();
	var minutes = (this.getMinutes() < 10) ? "0" + this.getMinutes() : this.getMinutes();
	var seconds = (this.getSeconds() < 10) ? "0" + this.getSeconds() : this.getSeconds();

	var offset = this.getTimezoneOffset() / 60;

	return this.getFullYear() + "-" + month + "-" + day + "T" + hours + ":" + minutes + ":" + seconds + "-0" + offset + "00";
};
