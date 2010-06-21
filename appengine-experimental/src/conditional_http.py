
from google.appengine.ext import db
from models import CHPIncident

import hashlib
import logging

def isNotModified(webapp):
	center = webapp.request.get("center")
	dispatch = webapp.request.get("dispatch")
	area = webapp.request.get("area")

	query = CHPIncident.all()
	query.order('-last_update')
	if center != "":
		query.filter('CenterID =', center)
	if dispatch != "":
		query.filter('DispatchID =', dispatch)
	if area != "":
		query.filter('Area =', area)

	last_mod = query.get().last_update.strftime("%a, %d %b %Y %H:%M:%S GMT")

	logging.info(last_mod)

	# HTTP/1.1
	if 'If-None-Match' in webapp.request.headers and webapp.request.headers['If-None-Match'] == hashlib.sha1(last_mod).hexdigest():
		webapp.response.set_status(304)
		return True;

	# HTTP/1.0
	if 'If-Modified-Since' in webapp.request.headers and webapp.request.headers['If-Modified-Since'] == last_mod:
		webapp.response.set_status(304)
		return True;

	return False;

def setConditionHeaders(webapp):
	center = webapp.request.get("center")
	dispatch = webapp.request.get("dispatch")
	area = webapp.request.get("area")

	query = CHPIncident.all()
	query.order('-last_update')
	if center != "":
		query.filter('CenterID =', center)
	if dispatch != "":
		query.filter('DispatchID =', dispatch)
	if area != "":
		query.filter('Area =', area)

	last_mod = query.get().last_update.strftime("%a, %d %b %Y %H:%M:%S GMT")

	webapp.response.headers["Last-Modified"] = last_mod
	webapp.response.headers["ETag"] = '"'+hashlib.sha1(last_mod).hexdigest()+'"'
