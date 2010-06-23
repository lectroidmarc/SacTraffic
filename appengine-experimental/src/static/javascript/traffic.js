var map;
var incident_markers = {};

function initialize() {
	var latlng = new google.maps.LatLng(37.5, -119.2);
	var myOptions = {
		zoom: 6,
		center: latlng,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById("map"), myOptions);

	update_incidents();
}

function update_incidents () {
	jQuery.getJSON("/json", function (data) {
		jQuery.each(data, function (i, incident) {
			if (incident.geolocation && (incident.Status == "new" || incident.Status == "active")) {
				var infowindow = new google.maps.InfoWindow({
					content: '<div class="logtype">' + incident.LogType + '</div><div class="location">' + incident.Location + '</div><div class="area">' + incident.Area + '</div><div class="logtime">' + incident.LogTime + '</div>'
				});

				if (incident_markers[incident.ID]) {
					// Marker exists, just update the info window...
					google.maps.event.clearInstanceListeners(incident_markers[incident.ID]);

					google.maps.event.addListener(incident_markers[incident.ID], 'click', function() {
						infowindow.open(map, incident_markers[incident.ID]);
					});

					// and the icon
					incident_markers[incident.ID].setIcon("http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=caution|FF0000");
				} else {
					var icon_url = (incident.Status == "new") ? "http://chart.apis.google.com/chart?chst=d_map_xpin_icon&chld=pin_star|caution|FF0000|FFFF00" : "http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=caution|FF0000";

					var marker = new google.maps.Marker({
						position: new google.maps.LatLng(incident.geolocation.lat, incident.geolocation.lon),
						map: map,
						title: incident.LogType,
						icon: icon_url
					});

					var listener = google.maps.event.addListener(marker, 'click', function() {
						infowindow.open(map, marker);
					});

					incident_markers[incident.ID] = marker;
				}
			} else if (incident.geolocation) {
				// old incident
				if (incident_markers[incident.ID]) {
					// marker exists, we should do something with it...
					incident_markers[incident.ID].setIcon("http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=caution|bbbbbb");

					//incident_markers[incident.ID].setMap();
					//delete incident_markers[incident.ID];
				}
			}
		});

		setTimeout(update_incidents, 60000);
	});
}

function clear_incidents() {
	for (var x in incident_markers) {
		incident_markers[x].setMap();
	}

	incident_markers = {};
}

