from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from google.appengine.ext import db
from django.utils import simplejson as json

from models import CHPIncident

from datetime import datetime, timedelta
import pickle
import time
import conditional_http

class JsonHandler(webapp.RequestHandler):
	def get(self):
		center = self.request.get("center")
		dispatch = self.request.get("dispatch")
		area = self.request.get("area")

		last_mod = conditional_http.getLastMod(self)
		if conditional_http.isNotModified(self, last_mod):
			return

		incident_query = CHPIncident.all()
		incident_query.order('-LogTime')
		if center != "":
			incident_query.filter('CenterID =', center)
		if dispatch != "":
			incident_query.filter('DispatchID =', dispatch)
		if area != "":
			incident_query.filter('Area =', area)

		output_list = []
		for incident in incident_query:
			incident_dict = {
				'Area': incident.Area,
				'ID': incident.LogID,
				'Location': incident.Location,
				'LogTime': incident.LogTime.strftime("%m/%d/%Y %H:%M:%S GMT"),
				'LogTimeEpoch': time.mktime(incident.LogTime.timetuple()),
				'LogType': incident.LogType,
				'TBXY': incident.TBXY,
				'ThomasBrothers': incident.ThomasBrothers
			}

			if incident.geolocation is not None:
				incident_dict['geolocation'] = {
					'lat': incident.geolocation.lat,
					'lon': incident.geolocation.lon
				}

			# If an incident hasn't been updated in the XML update interval
			# (5 minutes) then it's fallen off the list and is, by definition,
			# inactive.
			if incident.last_update < datetime.utcnow() - timedelta(minutes=5):
				incident_dict['Status'] = 'inactive'
			else:
				if incident.added > datetime.utcnow() - timedelta(minutes=5):
					incident_dict['Status'] = 'new'
				else:
					incident_dict['Status'] = 'active'

			if incident.LogDetails is not None:
				incident_dict['LogDetails'] = pickle.loads(incident.LogDetails)

			output_list.append(incident_dict)


		self.response.headers["Content-Type"] = "application/json"
		conditional_http.setConditionalHeaders(self, last_mod)

		callback = self.request.get("callback")
		if callback != "":
			self.response.out.write(callback + "(")

		self.response.out.write(json.dumps(output_list, sort_keys=True))

		if callback != "":
			self.response.out.write(")")


application = webapp.WSGIApplication([('/json', JsonHandler)],
									 debug=True)

def main():
	util.run_wsgi_app(application)

if __name__ == '__main__':
	main()
