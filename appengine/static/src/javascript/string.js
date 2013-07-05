/**
 * @fileoverview String extensions.
 */

/* Template substitution (source: Doug Crockford) */
if (typeof String.prototype.supplant !== 'function') {
	/**
	 * Template substitution.
	 * @param {Object} o An object of keys to replace.
	 */
	String.prototype.supplant = function (o) {
		return this.replace(/{([^{}]*)}/g, function (a, b) {
			var r = o[b];
			return typeof r === 'string' ? r : a;
		});
	};
}
