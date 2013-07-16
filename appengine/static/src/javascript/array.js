/**
 * @fileoverview Array extensions.
 * @external Array
 */

if (typeof Array.prototype.max === 'undefined') {
  /**
   * Returns the largest value in an array of numbers.
   * @method external:Array#max
   * @returns {Number}
   */
  Array.prototype.max = function () {
    return Math.max.apply(null, this);
  }
}

if (typeof Array.prototype.min === 'undefined') {
  /**
   * Returns the smallest value in an array of numbers.
   * @method external:Array#min
   * @returns {Number}
   */
  Array.prototype.min = function () {
    return Math.min.apply(null, this);
  }
}
