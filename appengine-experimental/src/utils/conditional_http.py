import hashlib

from models import CHPIncident


def getLastMod(webapp):
	center = webapp.request.get("center")
	dispatch = webapp.request.get("dispatch")
	area = webapp.request.get("area")

	last_mod_query = CHPIncident.all()
	last_mod_query.order('-modified')
	if center != "":
		last_mod_query.filter('CenterID =', center)
	if dispatch != "":
		last_mod_query.filter('DispatchID =', dispatch)
	if area != "":
		last_mod_query.filter('Area =', area)

	last_mod_entity = last_mod_query.get()
	if last_mod_entity is not None:
		return last_mod_entity.modified

	return None


def isNotModified(webapp, last_mod_date):
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
	if last_mod_date is not None:
		last_mod = last_mod_date.strftime("%a, %d %b %Y %H:%M:%S GMT")

		webapp.response.headers["Last-Modified"] = last_mod
		webapp.response.headers["ETag"] = '"'+hashlib.sha1(last_mod).hexdigest()+'"'
