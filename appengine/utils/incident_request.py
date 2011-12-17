"""Unified request hadling for CHP Incidents.

"""
import hashlib
import webapp2
from datetime import datetime

from google.appengine.api import memcache

from models import CHPData, CHPIncident


class RequestHandler(webapp2.RequestHandler):
	incidents_last_mod = None

	def get_incidents(self):
		"""Return CHP incidents given various request args.

		"""
		id = self.request.get("id")
		center = self.request.get("center")
		dispatch = self.request.get("dispatch")
		area = self.request.get("area")
		city = self.request.get("city")
		since = self.request.get("since")

		memcache_key = "incidents-%s-%s-%s-%s-%s-%s" % (id, center, dispatch, area, city, since)
		memcache_expiry_time = 60

		incidents = memcache.get(memcache_key)
		if incidents is None:
			if id == "":
				query = CHPIncident.all()
				query.order('-LogTime')
				if center != "":
					query.filter('CenterID =', center)
				if dispatch != "":
					query.filter('DispatchID =', dispatch)
				if area != "":
					query.filter('Area =', area)
				if city != "":
					query.filter('city =', city)
				if since != "":
					query.filter('LogTime >', datetime.fromtimestamp(float(since)))

				incidents = query.fetch(10000)
			else:
				# Handle single incident requests, slightly different approach
				# We want to use get_by_key_name() instead of filtering.
				incidents = []
				incident = CHPIncident.get_by_key_name(id)
				if incident is not None:
					incidents.append(incident)

			try:
				memcache.add(memcache_key, incidents, memcache_expiry_time)
			except ValueError:
				pass

		if len(incidents) > 0:
			self.incidents_last_mod = max(incidents, key=lambda incident: incident.updated).updated
		else:
			self.incidents_last_mod = CHPData.last_updated()

		self.incidents = incidents

	def is_not_modified(self):
		"""Test if conditional http headers exist and match accordingly.

		If they match, send a 304 header and return True to the caller.

		"""
		if self.incidents_last_mod is not None:
			last_mod = self.incidents_last_mod.strftime("%a, %d %b %Y %H:%M:%S GMT")

			# HTTP/1.1
			if 'If-None-Match' in self.request.headers and self.request.headers['If-None-Match'] == hashlib.sha1(last_mod).hexdigest():
				self.response.set_status(304)
				return True;

			# HTTP/1.0
			if 'If-Modified-Since' in self.request.headers and self.request.headers['If-Modified-Since'] == last_mod:
				self.response.set_status(304)
				return True;

		return False;

	def send_conditional_headers(self):
		"""Set up the proper conditional http headers given the last_mod date.

		"""
		if self.incidents_last_mod is not None:
			last_mod = self.incidents_last_mod.strftime("%a, %d %b %Y %H:%M:%S GMT")

			self.response.headers["Last-Modified"] = last_mod
			self.response.headers["ETag"] = '"'+hashlib.sha1(last_mod).hexdigest()+'"'
