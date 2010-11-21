"""Functions to simplify the setup and testing of 304 headers."""

import hashlib

from models import CHPIncident


def isNotModified(webapp, last_mod_date):
	"""Test if the right conditional http headers exist and match accordingly.
	If they match, return a 304 and True to the caller."""
	if last_mod_date is not None:
		last_mod = last_mod_date.strftime("%a, %d %b %Y %H:%M:%S GMT")

		# HTTP/1.1
		if 'If-None-Match' in webapp.request.headers and webapp.request.headers['If-None-Match'] == hashlib.sha1(last_mod).hexdigest():
			webapp.response.set_status(304)
			return True;

		# HTTP/1.0
		if 'If-Modified-Since' in webapp.request.headers and webapp.request.headers['If-Modified-Since'] == last_mod:
			webapp.response.set_status(304)
			return True;

	return False;


def setConditionalHeaders(webapp, last_mod_date):
	"""Set up the proper conditional http headers given the last_mod date."""
	if last_mod_date is not None:
		last_mod = last_mod_date.strftime("%a, %d %b %Y %H:%M:%S GMT")

		webapp.response.headers["Last-Modified"] = last_mod
		webapp.response.headers["ETag"] = '"'+hashlib.sha1(last_mod).hexdigest()+'"'
