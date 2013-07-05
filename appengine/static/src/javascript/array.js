/**
 * @fileoverview Array extensions.
 */

if (typeof Array.prototype.max === 'undefined') {
  /**
   * Returns the largest value in an array.
   */
  Array.prototype.max = function () {
    return Math.max.apply(null, this);
  }
}

if (typeof Array.prototype.min === 'undefined') {
  /**
   * Returns the smallest value in an array.
   */
  Array.prototype.min = function () {
    return Math.min.apply(null, this);
  }
}
