import datetime
import pickle

from google.appengine.api import memcache
from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from django.utils import simplejson as json

from models import CHPIncident
from utils import conditional_http


class JsonHandler(webapp.RequestHandler):
	def get(self):
		id = self.request.get("id")
		center = self.request.get("center")
		dispatch = self.request.get("dispatch")
		area = self.request.get("area")
		city = self.request.get("city")
		since = self.request.get("since")
		callback = self.request.get("callback")

		memcache_key = "json-%s-%s-%s-%s-%s-%s" % (id, center, dispatch, area, city, since)
		memcache_expiry_time = 60
		last_mod = datetime.datetime.utcnow()	# XXX should this be None?

		if id == "":
			incidents = memcache.get(memcache_key)
			if incidents is None:
				incidents = CHPIncident.all()
				incidents.order('-LogTime')
				if center != "":
					incidents.filter('CenterID =', center)
				if dispatch != "":
					incidents.filter('DispatchID =', dispatch)
				if area != "":
					incidents.filter('Area =', area)
				if city != "":
					incidents.filter('city =', city)
				if since != "":
					incidents.filter('LogTime >', datetime.datetime.fromtimestamp(float(since)))

				memcache.add(memcache_key, incidents, memcache_expiry_time)

			if incidents.count(1) > 0:
				last_mod = max(incidents, key=lambda incident: incident.updated).updated
				if conditional_http.isNotModified(self, last_mod):
					return
		else:
			# Handle single incident requests, slightly different approach
			# We want to use get_by_key_name() instead of filtering.
			incidents = []
			incident = memcache.get(memcache_key)
			if incident is None:
				incident = CHPIncident.get_by_key_name(id)
				memcache.add(memcache_key, incident, memcache_expiry_time)

			if incident is not None:
				last_mod = incident.updated
				if conditional_http.isNotModified(self, last_mod):
					return
				incidents.append(incident)

		output_list = []
		for incident in incidents:
			incident_dict = {
				'Area': incident.Area,
				'ID': incident.key().name(),
				'Location': incident.Location,
				'LogDetails': pickle.loads(incident.LogDetails),
				'LogTime': incident.logTimeLocal.strftime("%m/%d/%Y %I:%M:%S %p"),
				'LogTimeEpoch': incident.logTimeEpoch,
				'LogType': incident.LogType,
				'TBXY': incident.TBXY,
				'ThomasBrothers': incident.ThomasBrothers,
				'status': incident.status
			}

			if incident.geolocation is not None:
				incident_dict['geolocation'] = {
					'lat': incident.geolocation.lat,
					'lon': incident.geolocation.lon
				}

			if incident.city is not None:
				incident_dict['city'] = incident.city

			output_list.append(incident_dict)

		self.response.headers["Content-Type"] = "application/json"
		conditional_http.setConditionalHeaders(self, last_mod)

		if callback != "":
			self.response.out.write("%s(" % callback)

		self.response.out.write(json.dumps(output_list, sort_keys=True))

		if callback != "":
			self.response.out.write(")")


application = webapp.WSGIApplication([('/json', JsonHandler)],
									 debug=True)

def main():
	util.run_wsgi_app(application)

if __name__ == '__main__':
	main()
