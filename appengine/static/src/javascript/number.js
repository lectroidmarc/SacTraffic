/**
 * @fileoverview Number extensions.
 * @external Number
 */

/**
 * Zero pad a number out to a specified length.
 * @method external:Number#zeroPad
 * @param {Number} [len=2] The length of the padded string.
 * @returns {String}
 */
Number.prototype.zeroPad = function (len) {
  var s = String(this);
  var c = '0';
  len = len || 2;

  while (s.length < len) {
    s = c + s;
  }

  return s;
};
