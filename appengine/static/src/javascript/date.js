/**
 * @fileoverview Date extensions.
 * @external Date
 */

/**
 * Provides an ISO 8601 datetime format to the Date object.
 * @method external:Date#getISO8601
 * @returns {String}
 */
Date.prototype.getISO8601 = function () {
	var month = this.getMonth() + 1;
	var offset = this.getTimezoneOffset() / 60;

	return this.getFullYear() + "-" + month.zeroPad() + "-" + this.getDate().zeroPad() + "T" + this.getHours().zeroPad() + ":" + this.getMinutes().zeroPad() + ":" + this.getSeconds().zeroPad() + "-0" + offset + "00";
};

/**
 * Provides a "pretty" time-only format to the Date object.
 * @example
 * date.getPrettyTime(); // returns 7:12 PM
 * @method external:Date#getPrettyTime
 * @returns {String}
 */
Date.prototype.getPrettyTime = function () {
	var hours = this.getHours();
	var ampm = "AM";

	if (hours > 12) {
		ampm = "PM";
		hours -= 12;
	} else if (hours == 12) {
		ampm = "PM";
	} else if (hours == 0) {
		hours = "12";
	}

	return hours + ":" + this.getMinutes().zeroPad() + " " + ampm;
};

/**
 * Provides a "pretty" datetime format to the Date object.
 * @example
 * date.getPrettyDateTime(); // returns 12/04/2011 7:12 PM
 * @method external:Date#getPrettyDateTime
 * @returns {String}
 */
Date.prototype.getPrettyDateTime = function () {
	var month = this.getMonth() + 1;

	return month + "/" + this.getDate().zeroPad() + "/" + this.getFullYear() + " " + this.getPrettyTime();
};

/**
 * Provides a Twittereque "ago" time.
 * @method external:Date#ago
 * @returns {String}
 */
Date.prototype.ago = function () {
	var now = new Date();
	var seconds_ago = (now.getTime() - this.getTime()) / 1000;
	var time = Math.floor(seconds_ago / 86400);
	var s = (time == 1) ? "" : "s";

	if (seconds_ago < 60) {
		return "less than a minute ago";
	} else if (seconds_ago < 3600) {
		time = Math.round(seconds_ago / 60);
		s = (time == 1) ? "" : "s";
		return time.toString() + " minute" + s + " ago";
	} else if (seconds_ago < 86400) {
		time = Math.floor(seconds_ago / 3600);
		s = (time == 1) ? "" : "s";
		if (time == 1) time = "an";
		return "over " + time.toString() + " hour" + s + " ago";
	}
};
