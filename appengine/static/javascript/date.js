/**
 * @fileoverview Date extensions.
 */

/**
 * Provides an ISO 8601 datetime format to the Date object.
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

/**
 * Provides a "pretty" time-only format to the Date object.
 *
 * Like: 7:12 PM
 */
Date.prototype.getPrettyTime = function () {
	var minutes = (this.getMinutes() < 10) ? "0" + this.getMinutes() : this.getMinutes();
	var hours = this.getHours();
	var ampm = "AM";

	if (hours > 12) {
		ampm = "PM";
		hours -= 12;
	} else if (hours == 0) {
		hours = "12";
	}

	return hours + ":" + minutes + " " + ampm;
};

/**
 * Provides a "pretty" datetime format to the Date object.
 *
 * Like: 12/04/2011 7:12 PM
 */
Date.prototype.getPrettyDateTime = function () {
	var month = this.getMonth() + 1;
	var day = (this.getDate() < 10) ? "0" + this.getDate() : this.getDate();

	return month + "/" + day + "/" + this.getFullYear() + " " + this.getPrettyTime();
};

/**
 * Provides a Twittereque "ago" time.
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
