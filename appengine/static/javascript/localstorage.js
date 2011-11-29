/**
 * @fileoverview Contains code for a wrapper around HTML5 localStorage.
 */

/**
 * @namespace Namespace encapsulating our local localStorage functionality.
 */
var LocalStorage = {
  /**
   * Sets an item into localStorage.  Optionally sets an expire time.
   * @param {String} key The key to use.
   * @param {Any} value The value to set.
   * @param {Number} [seconds] Optional expiration time in seconds.
   * @returns {Boolean}
   */
  setItem: function (key, value, seconds) {
    if (LocalStorage.supportsLocalStorage()) {
      var now = new Date();

      var storageObj = {
        expiry: now.getTime() + seconds * 1000,
        data: value
      }

      localStorage.setItem(key, JSON.stringify(storageObj));
      return true;
    } else {
      return false;      // localStorage not supported
    }
  },

  /**
   * Gets an item from localStorage
   * @param {String} key The key to use.
   * @returns {Any}
   */
  getItem: function (key) {
    if (LocalStorage.supportsLocalStorage()) {
      var now = new Date();
      var storedData = JSON.parse(localStorage.getItem(key));

      if (storedData) {
        if (storedData.expiry == null || now.getTime() <= storedData.expiry) {
          return storedData.data;
        } else {
          return null;  // data has expired
        }
      } else {
        return null;    // data doesn't exist
      }
    } else {
      return null;      // localStorage not supported
    }
  },

  /**
   * Removes an item from localStorage.  Simply a wrapper for localStorage.removeItem().
   * @param {String} key The key to use.
   */
  removeItem: function (key) {
    if (LocalStorage.supportsLocalStorage()) {
      localStorage.removeItem(key);
    }
  },

  /**
   * Tests if localStorage is available on the local machine.
   * @private
   * @returns {Boolean}
   */
  supportsLocalStorage: function () {
    try {
      return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
      return false;
    }
  }
}
