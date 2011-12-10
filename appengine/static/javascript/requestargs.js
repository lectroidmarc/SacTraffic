/**
 * @fileoverview Contains code for a handler for parsing query args.
 */

/**
 * @namespace Namespace encapsulating a simple getter for guery args.
 */
var RequestArgs = function() {
  var _GET;

  return {
    /**
     * Gets a query arg value.
     * @param {String} key The key to look for.
     * @returns The key value.
     */
    get: function (key) {
      if (typeof($_GET) === 'undefined') {
        _GET = {};

        document.location.search.replace(/\??(?:([^=]+)(?:=([^&]*))?&?)/g, function () {
          function decode(s) {
            if (typeof(s) !== 'undefined') {
              return decodeURIComponent(s.split("+").join(" "));
            }
          }

          _GET[decode(arguments[1])] = decode(arguments[2]);
        });
      }

      return _GET[key];
    }
  }
}();
