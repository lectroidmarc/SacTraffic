"""JSON Handler.

Returns CHP incident data in the JSON format.

"""
import json
import cPickle as pickle
import webapp2

from utils import incident_request


class JsonHandler(incident_request.RequestHandler):
	def get(self):
		self.get_incidents()

		# 304 check
		if self.is_not_modified():
			return

		# Build a Python list we can convert to JSON
		output_list = []
		for incident in self.incidents:
			incident_dict = {
				'Area': incident.Area,
				'ID': incident.key().name(),
				'Location': incident.Location,
				'LogDetails': pickle.loads(incident.LogDetails),
				'LogTime': "",
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

		# Output
		self.response.headers["Content-Type"] = "application/json"
		self.send_conditional_headers()

		callback = self.request.get("callback")
		if callback != "":
			self.response.write("%s(" % callback)

		self.response.write(json.dumps(output_list, sort_keys=True))

		if callback != "":
			self.response.write(")")


application = webapp2.WSGIApplication([('/json', JsonHandler)], debug=True)
