
import logging
import pickle
import re
import time
from datetime import datetime, timedelta

from google.appengine.ext import db
from google.appengine.ext import deferred

from models import CHPIncident
from utils.tzinfo import Pacific
from thirdparty.pubsubhubbub_publish import *


def process_chp_xml(chpState):
	for chpCenter in chpState:
		deferred.defer(process_chp_center, chpCenter);


def process_chp_center(chpCenter):
	incident_list = []
	psh_pings = []
	
	for chpDispatch in chpCenter:
		# For some reason, sometimes the Dispatch ID is blank
		# so skip these.
		if chpDispatch.attrib['ID'] == "":
			continue

		for chpLog in chpDispatch:
			log_time = datetime.strptime(chpLog.find('LogTime').text, '"%m/%d/%Y %I:%M:%S %p"').replace(tzinfo=Pacific())
			key_name = "%s.%s.%s.%d" % (chpCenter.attrib['ID'], chpDispatch.attrib['ID'], chpLog.attrib['ID'], time.mktime(log_time.timetuple()))
			logtype = chpLog.find('LogType').text.strip('"').partition(" - ")

			incident = CHPIncident(key_name = key_name,
				CenterID = chpCenter.attrib['ID'],
				DispatchID = chpDispatch.attrib['ID'],
				LogID = chpLog.attrib['ID'],
				LogTime = log_time,
				LogType = logtype[2],
				LogTypeID = logtype[0],
				Location = deCopIfy(chpLog.find('Location').text.strip('"')),
				Area = chpLog.find('Area').text.strip('"'),
				ThomasBrothers = chpLog.find('ThomasBrothers').text.strip('"'),
				TBXY = chpLog.find('TBXY').text.strip('"'),
				geolocation = geoConvertTBXY(chpCenter.attrib['ID'], chpLog.find('TBXY').text.strip('"'))
				)

			# Special handling for the LogDetails
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

			# Set up the PSH pings.  Note, we are NOT checking for actual
			# changes in the data, we are just assuming that the existance of
			# an incident in the CHP feed declares it as "updated" so we ping.
			psh_pings.append('http://www.sactraffic.org/atom?center=%s' % incident.CenterID)
			psh_pings.append('http://www.sactraffic.org/atom?dispatch=%s' % incident.DispatchID)
			psh_pings.append('http://www.sactraffic.org/atom?area=%s' % incident.Area)
			# Note: 'dispatch' defaults to STCC so ping accordingly
			if incident.DispatchID == "STCC":
				psh_pings.append('http://www.sactraffic.org/atom')

			# Save this incident
			incident_list.append(incident)

	# Store the incidents in a batch
	db.put(incident_list)

	# Ping the PSH hub
	#if len(set(psh_pings)):
	#	deferred.defer(publish, 'http://pubsubhubbub.appspot.com', set(psh_pings))

	logging.info("Processed %d incidents in %s." % (len(incident_list), chpCenter.attrib['ID']))


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


def geoConvertTBXY(center, tbxy):
	if tbxy != "":
		tbxy_parts = tbxy.partition(":")

		if center == "STCC":
			return db.GeoPt(
				lat = float(tbxy_parts[2]) * 0.00000274 +	 33.172,
				lon = float(tbxy_parts[0]) * 0.0000035  - 144.966
			)
		elif center == "SLCC":
			return db.GeoPt(
				lat = float(tbxy_parts[2]) * 0.00000275 +	 30.054,
				lon = float(tbxy_parts[0]) * 0.00000329 - 126.589
			)
		elif center == "FRCC":
			return db.GeoPt(
				lat = float(tbxy_parts[2]) * 0.00000274 +	 30.84,
				lon = float(tbxy_parts[0]) * 0.00000335 -  141
			)

	return None
