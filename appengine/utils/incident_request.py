"""Unified request hadling for CHP Incidents.

"""
import hashlib
import webapp2
from datetime import datetime

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

		if id == "":
			query = CHPIncident.query().order(-CHPIncident.LogTime)
			if center != "":
				query = query.filter(CHPIncident.CenterID == center)
			if dispatch != "":
				query = query.filter(CHPIncident.DispatchID == dispatch)
			if area != "":
				query = query.filter(CHPIncident.Area == area)
			if city != "":
				query = query.filter(CHPIncident.city == city)
			if since != "":
				query = query.filter(CHPIncident.LogTime > datetime.fromtimestamp(float(since)))

			incidents = query.fetch(10000)
		else:
			# Handle single incident requests directly, instead of filtering.
			incidents = []
			incident_key = ndb.Key(CHPIncident, id)
			incident = incident_key.get()
			if incident is not None:
				incidents.append(incident)

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
