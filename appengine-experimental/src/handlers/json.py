from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from google.appengine.ext import db
from django.utils import simplejson as json

from models import CHPIncident
from tzinfo import Pacific

from datetime import datetime, timedelta
import pickle
import time

class JsonHandler(webapp.RequestHandler):
	def get(self):
		output_list = []

		query = CHPIncident.gql("WHERE CenterID = :center AND DispatchID = :dispatch ORDER BY LogTime DESC", center=self.request.get("center", "STCC"), dispatch=self.request.get("dispatch", "STCC"))
		for incident in query:
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
				incident_dict['geolocation'] = str(incident.geolocation.lat) + "," + str(incident.geolocation.lon)

			if incident.last_update < datetime.utcnow() - timedelta(minutes=5):
				incident_dict['Status'] = 'inactive'
			else:
				incident_dict['Status'] = 'active'

			if incident.LogDetails is not None:
				incident_dict['LogDetails'] = pickle.loads(incident.LogDetails)

			output_list.append(incident_dict)


		self.response.headers["Content-Type"] = "application/json"

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
