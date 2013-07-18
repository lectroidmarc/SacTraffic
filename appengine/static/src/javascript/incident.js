/**
 * @fileoverview Contains code defining the Incident class.
 */

/**
 * Creates an Incident from CHP Incident data.
 * @class Represents a CHP Incident.
 * @this Incident
 * @param {Object} data A CHP Incident.
 * @property {String} Area
 * @property {String} ID
 * @property {String} Location
 * @property {String} LocationDesc
 * @property {Object} LogDetails
 * @property {Array.<Object>} LogDetails.details
 * @property {String} LogDetails.details.DetailTime
 * @property {String} LogDetails.details.IncidentDetail
 * @property {String} LogTime
 * @property {String} LogType
 * @property {String} city
 * @property {Object} geolocation
 * @property {Number} geolocation.lat
 * @property {Number} geolocation.lon
 */
var Incident = function (data) {
  this.Area = data.Area;
  this.ID = data.ID;
  this.Location = data.Location;
  this.LocationDesc = data.LocationDesc;
  this.LogDetails = data.LogDetails;
  this.LogTime = data.LogTime;
  this.LogType = data.LogType;
  this.city = data.city;
  this.geolocation = data.geolocation;
}

/**
 * Returns icon information based on the Incident type.
 * @returns {Object}
 */
Incident.prototype.getIcon = function () {
  var name;
  var cssPosition;

  if (/Fire/.test(this.LogType)) {
    name = "Fire";
    cssPosition = "-128px 0px";
  } else if (/Maintenance|Construction/.test(this.LogType)) {
    name = 'Maintenance';
    cssPosition = "-32px 0px";
  } else if (/Ambulance Enroute|Fatality/.test(this.LogType)) {
    name = 'Collision-serious';
    cssPosition = "-64px 0px";
  } else if (/Collision/.test(this.LogType)) {
    name = 'Collision';
    cssPosition = "-96px 0px";
  } else {
    name = "Hazard";
    cssPosition = "0px 0px";
  }

  return {
    name: name,
    cssPosition: cssPosition
  };
};
