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
		center = self.request.get("center")
		dispatch = self.request.get("dispatch")
		area = self.request.get("area")
		city = self.request.get("city")

		# Change this for the West Sac News-Leger since no one appears home there
		if "http://www.westsac.com/news-ledger" in self.request.headers['User-Agent']:
			if dispatch == "":
				dispatch = 'SACC'

		memcache_key = "incidents-%s-%s-%s-%s" % (center, dispatch, area, city)

		# Don't even try the cache if this looks like a PubSubHubBub request.
		if "pubsubhubbub" in self.request.headers['User-Agent']:
			incidents = None
		else:
			incidents = memcache.get(memcache_key)

		if incidents is None:
			query = CHPIncident.query().order(-CHPIncident.LogTime)

			if city != "":
				query = query.filter(CHPIncident.city == city)
			elif area != "":
				query = query.filter(CHPIncident.Area == area)
			elif dispatch != "":
				query = query.filter(CHPIncident.DispatchID == dispatch)
			elif center != "":
				query = query.filter(CHPIncident.CenterID == center)

			incidents = query.fetch(10000)

			try:
				memcache.set(memcache_key, incidents, 300)
			except:
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
