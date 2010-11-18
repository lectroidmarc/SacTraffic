import datetime
import pickle
import time

from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from django.utils import simplejson as json

from models import CHPIncident
from utils import conditional_http, tzinfo


class JsonHandler(webapp.RequestHandler):
	def get(self):
		id = self.request.get("id")
		center = self.request.get("center")
		dispatch = self.request.get("dispatch")
		area = self.request.get("area")
		callback = self.request.get("callback")

		last_mod = datetime.datetime.utcnow()	# XXX should this be None?

		if id == "":
			incidents = CHPIncident.all()
			incidents.order('-LogTime')
			if center != "":
				incidents.filter('CenterID =', center)
			if dispatch != "":
				incidents.filter('DispatchID =', dispatch)
			if area != "":
				incidents.filter('Area =', area)

			if incidents.count(1) > 0:
				last_mod = max(incidents, key=lambda incident: incident.updated).updated
				if conditional_http.isNotModified(self, last_mod):
					return
		else:
			incident = CHPIncident.get_by_key_name(id)
			last_mod = incident.updated
			if conditional_http.isNotModified(self, last_mod):
				return
			incidents = [incident]

		pacific_tz = tzinfo.Pacific()

		output_list = []
		for incident in incidents:
			incident_dict = {
				'Area': incident.Area,
				'ID': incident.key().name(),
				'Location': incident.Location,
				'LogDetails': pickle.loads(incident.LogDetails),
				'LogTime': (incident.LogTime + pacific_tz.utcoffset(incident.LogTime)).strftime("%m/%d/%Y %I:%M:%S %p"),
				'LogTimeEpoch': time.mktime(incident.LogTime.timetuple()),
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
