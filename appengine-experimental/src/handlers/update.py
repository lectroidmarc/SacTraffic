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
							Location = deCopIfy(chpLog.find('Location').text.strip('"')),
							Area = chpLog.find('Area').text.strip('"'),
							ThomasBrothers = chpLog.find('ThomasBrothers').text.strip('"'),
							TBXY = chpLog.find('TBXY').text.strip('"')
							)


						#
						# LogType/LogTypeID
						#
						logtype = chpLog.find('LogType').text.strip('"').partition(" - ")
						incident.LogTypeID = logtype[0]
						incident.LogType = logtype[2]


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

		self.response.out.write(template.render("../templates/update.html", template_values))


# Use app cahing and regex compiling
reJNO = re.compile(r'\bJNO\b', re.I)
reJSO = re.compile(r'\bJSO\b', re.I)
reJEO = re.compile(r'\bJEO\b', re.I)
reJWO = re.compile(r'\bJWO\b', re.I)

reNB = re.compile(r'\bNB\b', re.I)
reSB = re.compile(r'\bSB\b', re.I)
reEB = re.compile(r'\bEB\b', re.I)
reWB = re.compile(r'\bWB\b', re.I)

reOFR = re.compile(r'\bOFR\b', re.I)
reONR = re.compile(r'\bONR\b', re.I)
reCON = re.compile(r'\bCON\b', re.I)

reAT = re.compile(r'\bAT\b', re.I)
reON = re.compile(r'\bON\b', re.I)
reTO = re.compile(r'\bTO\b', re.I)

reSR51 = re.compile(r'\bSR51\b', re.I)

def deCopIfy(text):
	text = re.sub(reJNO, 'just north of', text)
	text = re.sub(reJSO, 'just south of', text)
	text = re.sub(reJEO, 'just east of', text)
	text = re.sub(reJWO, 'just west of', text)

	text = re.sub(reNB, 'north bound', text)
	text = re.sub(reSB, 'south bound', text)
	text = re.sub(reEB, 'east bound', text)
	text = re.sub(reWB, 'west bound', text)

	text = re.sub(reOFR, 'offramp', text)
	text = re.sub(reONR, 'onramp', text)
	text = re.sub(reCON, 'connector', text)

	text = re.sub(reAT, 'at', text)
	text = re.sub(reON, 'on', text)
	text = re.sub(reTO, 'to', text)

	text = re.sub(reSR51, 'CAP CITY FWY', text)

	return text


application = webapp.WSGIApplication([('/update', UpdateHandler)],
										 debug=True)

def main():
	util.run_wsgi_app(application)


if __name__ == '__main__':
	main()
