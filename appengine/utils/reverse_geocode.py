"""Reverse geocoding using the Google Geocoding API at:
	http://code.google.com/apis/maps/documentation/geocoding/index.html#ReverseGeocoding

	This pulls out the "long_name" of the "locality" type of the
	"address_components" of the "postal_code" result type.  Make sense?

"""
import json
import logging

from models import CHPIncident
from google.appengine.api import urlfetch


def load_city (incident):
	"""Loads the city info gleaned from reverse geocoding the incident location
	into the incident's datastore record.

	"""
	try:
		result = urlfetch.fetch("http://maps.googleapis.com/maps/api/geocode/json?latlng=%f,%f&sensor=false" % (incident.geolocation.lat, incident.geolocation.lon))
	except urlfetch.DownloadError:
		logging.warning("DownloadError. Reverse Geocode request took too long.")
	else:
		if result.status_code == 200:
			data = json.loads(result.content)
			if data['status'] == "OK":
				for result in data['results']:
					if result['types'].count('postal_code') > 0:
						for component in result['address_components']:
							if component['types'].count('locality') > 0:
								logging.info("setting %s city to %s." % (incident.key.string_id(), component['long_name']))
								incident.city = component['long_name']
								incident.put()
								return
				logging.info("No city found for %s." % incident.key().name())
				incident.city = ""	# set the city to "" so we don't keep trying to geocode it.
				incident.put()
			else:
				logging.warning("Google replied with a %s status in the geocode JSON." % data['status'])
		else:
			logging.warning("Google returned a " + str(result.status_code) + " status.")
