from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from google.appengine.api import urlfetch
from google.appengine.ext import db
from google.appengine.ext.webapp import template

from xml.etree import ElementTree
from models import CHPIncident
from datetime import datetime

from tzinfo import Pacific

import pickle
import re

class UpdateHandler(webapp.RequestHandler):
	def get(self):
		template_values = {}

		result = urlfetch.fetch("http://media.chp.ca.gov/sa_xml/sa.xml")

		if result.status_code == 200:
			incident_list = []

			chpState = ElementTree.XML(result.content)

			for chpCenter in chpState:
				for chpDispatch in chpCenter:
					for chpLog in chpDispatch:
						incident = CHPIncident(key_name = chpLog.attrib['ID'],
							CenterID = chpCenter.attrib['ID'],
							DispatchID = chpDispatch.attrib['ID'],
							LogID = chpLog.attrib['ID'],
							LogTime = datetime.strptime(chpLog.find('LogTime').text, '"%m/%d/%Y %I:%M:%S %p"').replace(tzinfo=Pacific()),
							LogType = chpLog.find('LogType').text.strip('"'),
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
							incident.geolocation = db.GeoPt(
								lat = float(tbxy[2]) * 0.00000274 +	 33.172,
								lon = float(tbxy[0]) * 0.0000035  - 144.966
							)


						#
						# Special handling for the LogDetails
						#
						LogDetails = {}
						logdetails_element = chpLog.find('LogDetails')

						# details
						#
						details = []
						details_element = logdetails_element.findall('details')
						for element in details_element:
							detail_dict = {
								'DetailTime': element.find('DetailTime').text.strip('"'),
								'IncidentDetail': element.find('IncidentDetail').text.strip('"')
							}
							details.append(detail_dict)
						LogDetails['details'] = details

						# units
						#
						units = []
						units_element = logdetails_element.findall('units')
						for element in units_element:
							detail_dict = {
								'DetailTime': element.find('DetailTime').text.strip('"'),
								'IncidentDetail': element.find('IncidentDetail').text.strip('"')
							}
							units.append(detail_dict)
						LogDetails['units'] = units

						incident.LogDetails = pickle.dumps(LogDetails)

						incident.put()
						incident_list.append(incident)

				template_values['incidents'] = incident_list
				template_values['count'] = len(incident_list)

		self.response.out.write(template.render("../templates/update.html", template_values))


def deCopIfy(text):
	text = re.sub(r'\bJNO\b', 'just north of', text)
	text = re.sub(r'\bJSO\b', 'just south of', text)
	text = re.sub(r'\bJEO\b', 'just east of', text)
	text = re.sub(r'\bJWO\b', 'just west of', text)

	text = re.sub(r'\bNB\b', 'north bound', text)
	text = re.sub(r'\bSB\b', 'south bound', text)
	text = re.sub(r'\bEB\b', 'east bound', text)
	text = re.sub(r'\bWB\b', 'west bound', text)

	text = re.sub(r'\bOFR\b', 'offramp', text)
	text = re.sub(r'\bONR\b', 'onramp', text)
	text = re.sub(r'\bCON\b', 'connector', text)

	text = re.sub(r'\bAT\b', 'at', text)
	text = re.sub(r'\bON\b', 'on', text)
	text = re.sub(r'\bTO\b', 'to', text)

	text = re.sub(r'\bSR51\b', 'CAP CITY FWY', text)

	return text


def main():
	application = webapp.WSGIApplication([('/update', UpdateHandler)],
										 debug=True)
	util.run_wsgi_app(application)


if __name__ == '__main__':
	main()
