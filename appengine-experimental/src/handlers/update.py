import logging
import pickle
import re
from datetime import datetime, timedelta
from xml.etree import ElementTree

from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from google.appengine.api import urlfetch
from google.appengine.ext import db
from google.appengine.ext.webapp import template

from models import CHPIncident
from utils.tzinfo import Pacific


class UpdateHandler(webapp.RequestHandler):
	def get(self):
		template_values = {}

		try:
			result = urlfetch.fetch("http://media.chp.ca.gov/sa_xml/sa.xml", deadline=10)
		except urlfetch.DownloadError:
			error = "DownloadError. CHP request took too long."
			logging.warning(error)
			template_values['error'] = error

			touchActiveIncidents()
		else:
			if result.status_code == 200:
				incident_list = []

				try:
					chpState = ElementTree.XML(result.content)
				except ElementTree.ExpatError, e:
					error = "XML processing error. %s" % e.message
					logging.warning(error)
					template_values['error'] = error

					touchActiveIncidents()
				else:
					for chpCenter in chpState:
						for chpDispatch in chpCenter:
							# For some reason, sometimes the Dispatch ID is blank
							# so skip these.
							if chpDispatch.attrib['ID'] == "":
								continue

							for chpLog in chpDispatch:
								incident = CHPIncident.get_by_key_name(chpLog.attrib['ID'])
								if incident is None:
									incident = CHPIncident(key_name = chpLog.attrib['ID'],
										CenterID = chpCenter.attrib['ID'],
										DispatchID = chpDispatch.attrib['ID'],
										LogID = chpLog.attrib['ID'],
										LogTime = datetime.strptime(chpLog.find('LogTime').text, '"%m/%d/%Y %I:%M:%S %p"').replace(tzinfo=Pacific()),
										Location = deCopIfy(chpLog.find('Location').text.strip('"')),
										Area = chpLog.find('Area').text.strip('"'),
										ThomasBrothers = chpLog.find('ThomasBrothers').text.strip('"'),
										TBXY = chpLog.find('TBXY').text.strip('"'),
										modified = datetime.utcnow()
										)

									#
									# Geocoding
									#
									if incident.TBXY != "":
										tbxy = incident.TBXY.partition(":")
										if incident.CenterID == "STCC":
											incident.geolocation = db.GeoPt(
												lat = float(tbxy[2]) * 0.00000274 +	 33.172,
												lon = float(tbxy[0]) * 0.0000035  - 144.966
											)
										elif incident.CenterID == "SLCC":
											incident.geolocation = db.GeoPt(
												lat = float(tbxy[2]) * 0.00000275 +	 30.054,
												lon = float(tbxy[0]) * 0.00000329 - 126.589
											)
										elif incident.CenterID == "FRCC":
											incident.geolocation = db.GeoPt(
												lat = float(tbxy[2]) * 0.00000274 +	 30.84,
												lon = float(tbxy[0]) * 0.00000335 -  141
											)

								#
								# LogType/LogTypeID
								#
								# I *think* the LogType/LogTypeID can change as
								# the situation evolves.
								#
								# (ex: 'Traffic Collision - No Details' could
								# become 'Possible Fatality')
								#
								logtype = chpLog.find('LogType').text.strip('"').partition(" - ")
								if incident.LogTypeID != logtype[0]:
									incident.LogTypeID = logtype[0]
									incident.LogType = logtype[2]
									incident.modified = datetime.utcnow()


								#
								# Special handling for the LogDetails
								#
								LogDetails = {
									'details': [],
									'units': []
								}
								logdetails_element = chpLog.find('LogDetails')
								for element in logdetails_element:
									detail_dict = {
										'DetailTime': element.find('DetailTime').text.strip('"'),
										'IncidentDetail': element.find('IncidentDetail').text.strip('"')
									}
									LogDetails[element.tag].append(detail_dict)

								pickedLogDetails = pickle.dumps(LogDetails)

								if incident.LogDetails != pickedLogDetails:
									incident.LogDetails = pickle.dumps(LogDetails)
									incident.modified = datetime.utcnow()


								incident.put()
								incident_list.append(incident)

						template_values['incidents'] = incident_list
						template_values['count'] = len(incident_list)

			else:
				error = "CHP server returned " + str(result.status_code) + " status."
				logging.warning(error)
				template_values['error'] = error

		self.response.out.write(template.render("../templates/update.html", template_values))


# Use app cahing and regex compiling
coplingo = [
	{ 'regex': re.compile(r'\bJNO\b', re.I), 'str': "just north of" },
	{ 'regex': re.compile(r'\bJSO\b', re.I), 'str': "just south of" },
	{ 'regex': re.compile(r'\bJEO\b', re.I), 'str': "just east of" },
	{ 'regex': re.compile(r'\bJWO\b', re.I), 'str': "just west of" },

	{ 'regex': re.compile(r'\bNB\b', re.I), 'str': "north bound" },
	{ 'regex': re.compile(r'\bSB\b', re.I), 'str': "south bound" },
	{ 'regex': re.compile(r'\bEB\b', re.I), 'str': "east bound" },
	{ 'regex': re.compile(r'\bWB\b', re.I), 'str': "west bound" },

	{ 'regex': re.compile(r'\bOFR\b', re.I), 'str': "offramp" },
	{ 'regex': re.compile(r'\bONR\b', re.I), 'str': "onramp" },
	{ 'regex': re.compile(r'\bCON\b', re.I), 'str': "connector" },

	{ 'regex': re.compile(r'\bAT\b', re.I), 'str': "at" },
	{ 'regex': re.compile(r'\bON\b', re.I), 'str': "on" },
	{ 'regex': re.compile(r'\bTO\b', re.I), 'str': "to" },

	{ 'regex': re.compile(r'\bSR51\b', re.I), 'str': "CAP CITY FWY" }
]


def deCopIfy(text):
	for lingo in coplingo:
		text = re.sub(lingo['regex'], lingo['str'], text)

	return text[0].upper() + text[1:]


def touchActiveIncidents():
	# This is called in an error state. Roll through any incidents updated
	# in the last update (i.e.: "active" incidents or ones updated < 10
	# minutes ago) and "touch" them so they stay active.
	query = CHPIncident.gql("WHERE updated > :1", datetime.utcnow() - timedelta(minutes=10))
	for incident in query:
		incident.put()


application = webapp.WSGIApplication([('/update', UpdateHandler)],
										 debug=True)

def main():
	util.run_wsgi_app(application)


if __name__ == '__main__':
	main()
