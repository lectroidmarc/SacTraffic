"""Reverse geocoding using the GeoNames API at:
	http://www.geonames.org/export/reverse-geocoding.html

	This pulls out the "placeName" of the first "postalCode" which should be
	the zip code under the location.

	Note: GeoNames works on "credits".  30000 credit daily limit and 2000 hourly.
	findNearbyPostalCodes is 2 credits per request, 3 credits for more
	than 500 records.
"""
import json
import logging

from google.appengine.api import urlfetch


def load_city (incident):
	"""Loads the city info gleaned from reverse geocoding the incident location
	into the incident's datastore record.

	"""
	try:
		result = urlfetch.fetch("http://api.geonames.org/findNearbyPostalCodesJSON?lat=%f&lng=%f&username=lectroidmarc" % (incident.geolocation.lat, incident.geolocation.lon))
	except urlfetch.DownloadError as err:
		logging.warning(err)
	else:
		if result.status_code == 200:
			data = json.loads(result.content)
			if 'postalCodes' in data:
				local_postal_code = data['postalCodes'][0]
				if 'placeName' in local_postal_code:
					city = local_postal_code['placeName']

					logging.info("setting %s city to %s." % (incident.key.string_id(), city))
					incident.city = city
				else:
					logging.info("No city found for %s.", incident.key.string_id())
					incident.city = ""	# set the city to "" so we don't keep trying to geocode it.

				incident.put()
			elif 'status' in data:
				logging.warning("GeoNames replied with: %s", data['status']['message'])
			else:
				logging.warning("Unknown response from GeoNames.")


		else:
			logging.warning("GeoNames returned a %d status.", result.status_code)
