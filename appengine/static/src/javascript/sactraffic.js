/**
 * @fileoverview Base functions and globals for sactraffic.org.
 * @requires $
 */

/**
 * Global variable for the traffic map.
 * Allows other elements to interact with it if it's defined.
 */
var trafficmap;
var incidents = new IncidentList($('.incidents'));

/**
 * Fetches the incident JSON and processes it accordingly.
 */
var get_incidents = function () {
  $.getJSON('/json?dispatch=SACC', function (data) {
    incidents.element.find('.loading').remove();

    incidents.update(data);

    if (typeof trafficmap !== 'undefined') {
      trafficmap.update(incidents);
    }

    //setTimeout(get_incidents, 60000);
  });
};

var show_incident = function (evt, incident) {
  console.log('Hello ' + incident.ID);

  var incident_date = new Date(incident.LogTime * 1000);
  var point = (incident.geolocation) ? incident.geolocation : null;

  var incident_li = $('<li/>').attr('id', incident.ID.replace(/\./g, '_')).addClass('incident').addClass('vevent').appendTo(this.element).click(function () {
    $(this).find('.details').slideToggle();
  });

  // The marker icon
  $('<div/>').addClass('marker').css('background-position', incident.getIcon().cssPosition).appendTo(incident_li);

  // Summary...
  $('<div/>').addClass('logtype summary').html(incident.LogType).appendTo(incident_li);

  // Location
  $('<div/>').addClass('location').html(incident.Location).appendTo(incident_li);

  // City
  var city = (incident.city) ? incident.city : incident.Area;
  $('<div/>').addClass('city').html(city).appendTo(incident_li);

  // Time
  $('<div/>').addClass('logtime').html(incident_date.getPrettyDateTime()).append(
    $('<span/>').addClass('dtstart').html(incident_date.getISO8601())
  ).appendTo(incident_li);

  // Add the geo microfoemat
  if (point) {
    $('<div/>').addClass('geo').append(
      $('<span/>').addClass('latitude').html(point.lat)
    ).append(
      $('<span/>').addClass('longitude').html(point.lon)
    ).appendTo(incident_li);
  }

  // Add details
  var details_ul = $('<ul/>').addClass('details').appendTo(incident_li);
  if (incident.LogDetails.details.length > 0) {
    for (var x = 0; x < incident.LogDetails.details.length; x++) {
      var detail = incident.LogDetails.details[x];

      var detail_li = $('<li/>').addClass('detail').appendTo(details_ul);
      $('<span/>').addClass('detailtime').text(detail.DetailTime.replace(/.*\d\d\d\d\s+/, '') + ": ").appendTo(detail_li);
      $('<span/>').addClass('incidentdetail').text(detail.IncidentDetail).appendTo(detail_li);
    }
  } else {
    $('<li/>').addClass('detail').text('No details.').appendTo(details_ul);
  }

  // Show it
  incident_li.slideDown();
};

var update_incident = function (evt, incident) {
  console.log('Oh, it\'s you, ' + incident.ID);

  var incident_li = $('#' + incident.ID.replace(/\./g, '_'));

  // Details -- simply replace them...
  if (incident.LogDetails.details.length > 0) {
    var details_ul = incident_li.children('.details').empty();
    for (var x = 0; x < incident.LogDetails.details.length; x++) {
      var detail = incident.LogDetails.details[x];

      var detail_li = $('<li/>').addClass('detail').appendTo(details_ul);
      $('<span/>').addClass('detailtime').html(detail.DetailTime.replace(/.*\d\d\d\d\s+/, '') + ": ").appendTo(detail_li);
      $('<span/>').addClass('incidentdetail').html(detail.IncidentDetail).appendTo(detail_li);
    }
  }
};

var remove_incident = function (evt, id) {
  console.log('Goodbye ' + id);

  var incident_li = $('#' + id.replace(/\./g, '_'));

  incident_li.slideUp(function () {
    incident_li.remove();
  });
};

$(incidents).on('st_new_incident', show_incident);
$(incidents).on('st_update_incident', update_incident);
$(incidents).on('st_delete_incident', remove_incident);

window.addEventListener('resize', function () {
  if (typeof trafficmap !== "undefined") {
    trafficmap.resize();
  }
});
