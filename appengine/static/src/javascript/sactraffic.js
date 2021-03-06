/**
 * @fileoverview Base functions and globals for sactraffic.org.
 * @requires jQuery
 */

/** Global holding the CHP Incidents */
var incidents = new IncidentList($('.incidents'));
if (typeof google !== 'undefined' && typeof google.maps !== 'undefined') {
  /** Global holding the CHP Traffic Map */
  var trafficmap = new TrafficMap('map', incidents);
}

/**
 * Fetches the incident JSON and processes it accordingly.
 */
var get_incidents = function () {
  $.ajax({
    url: '/json?dispatch=SACC',
    'ifModified': true,
    success: function (data, textStatus, jqXHR) {
      if (textStatus === 'success') {
        incidents.update(data);

        // Show something that says "no incidents" if we have no incidents.
        if (incidents.size() === 0) {
          if (incidents.element.children('.noincidents').length === 0) {
            $('<li/>').addClass('incident').addClass('noincidents').text('No current CHP incidents.').appendTo(incidents.element);
          }
        } else {
          incidents.element.children('.noincidents').remove();
        }
      }

      setTimeout(get_incidents, 30000);
    },
    complete: function (jqXHR, textStatus) {
      incidents.element.find('.loading').remove();
    }
  });
};

/**
 * Handler to show new incidents.
 * @this IncidentList
 * @param {eventObject} evt The jQuery event object.
 * @param {Incident} incident The new Incident.
 */
var show_incident = function (evt, incident) {
  //console.debug('Hello ' + incident.ID);
  var incident_li = $('<li/>').attr('id', incident.ID.replace(/\./g, '_')).addClass('incident').addClass('vevent').prependTo(this.element).click(function () {
    if (_gaq)
      _gaq.push(['_trackEvent', 'Incident Details', 'show_incident_click', incident.ID]);

    $(this).find('.details').slideToggle();
  });

  // The marker icon
  $('<div/>').addClass('marker').css('background-position', incident.getIcon().cssPosition).appendTo(incident_li);

  // Summary/LogType
  $('<div/>').addClass('logtype summary').text(incident.LogType).appendTo(incident_li);

  // Location
  $('<div/>').addClass('location').text(incident.Location).appendTo(incident_li);

  // City
  var city = (incident.city) ? incident.city : incident.Area;
  $('<div/>').addClass('city').text(city).appendTo(incident_li);

  // Time
  var incident_date = new Date(incident.LogTime * 1000);
  $('<div/>').addClass('logtime').text(incident_date.getPrettyDateTime()).append(
    $('<span/>').addClass('dtstart').text(incident_date.getISO8601())
  ).appendTo(incident_li);

  // Add the geo microformat
  if (incident.geolocation) {
    $('<div/>').addClass('geo').append(
      $('<span/>').addClass('latitude').text(incident.geolocation.lat)
    ).append(
      $('<span/>').addClass('longitude').text(incident.geolocation.lon)
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

/**
 * Handler to update incidents.
 * @param {eventObject} evt The jQuery event object.
 * @param {Incident} incident The updated Incident.
 */
var update_incident = function (evt, incident) {
  //console.debug('Oh, it\'s you, ' + incident.ID);
  var incident_li = $('#' + incident.ID.replace(/\./g, '_'));

  // The marker icon
  incident_li.children('logtype').css('background-position', incident.getIcon().cssPosition);

  // Summary/LogType
  incident_li.children('logtype').text(incident.LogType);

  // Details -- simply replace them...
  if (incident.LogDetails.details.length > 0) {
    var details_ul = incident_li.children('.details').empty();
    for (var x = 0; x < incident.LogDetails.details.length; x++) {
      var detail = incident.LogDetails.details[x];

      var detail_li = $('<li/>').addClass('detail').appendTo(details_ul);
      $('<span/>').addClass('detailtime').text(detail.DetailTime.replace(/.*\d\d\d\d\s+/, '') + ": ").appendTo(detail_li);
      $('<span/>').addClass('incidentdetail').text(detail.IncidentDetail).appendTo(detail_li);
    }
  }
};

/**
 * Handler to remove incidents.
 * @param {eventObject} evt The jQuery event object.
 * @param {String} id The deleted incident ID.
 */
var remove_incident = function (evt, id) {
  //console.debug('Goodbye ' + id);
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

// Start this thing...
get_incidents();
