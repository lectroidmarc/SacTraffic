from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from google.appengine.api import urlfetch
from google.appengine.ext import db
from google.appengine.ext.webapp import template

from xml.etree import ElementTree
from models import CHPIncident
from datetime import datetime

from tzinfo import Pacific

import logging
import pickle
import re

class UpdateHandler(webapp.RequestHandler):
	def get(self):
		template_values = {}

		try:
			result = urlfetch.fetch("http://media.chp.ca.gov/sa_xml/sa.xml")
		except urlfetch.DownloadError:
			error = "DownloadError. CHP request took too long."
			logging.warning(error)
			template_values['error'] = error
		else:
			if result.status_code == 200:
				incident_list = []

				chpState = ElementTree.XML(result.content)

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
									TBXY = chpLog.find('TBXY').text.strip('"')
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
							incident.LogTypeID = logtype[0]
							incident.LogType = logtype[2]


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

							incident.LogDetails = pickle.dumps(LogDetails)


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


application = webapp.WSGIApplication([('/update', UpdateHandler)],
										 debug=True)

def main():
	util.run_wsgi_app(application)


if __name__ == '__main__':
	main()
