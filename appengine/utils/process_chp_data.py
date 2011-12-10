"""Functions for processing the CHP data.

"""
import logging
import pickle
import os
import re
import time
import urllib
from datetime import datetime, timedelta

from google.appengine.ext import db
from google.appengine.ext import deferred

from models import CHPIncident
from utils import tzinfo, reverse_geocode
from thirdparty import pubsubhubbub_publish


def process_chp_xml(chpState):
	"""Process a whole CHP feed in ETree format.

	"""
	for chpCenter in chpState:
		deferred.defer(process_chp_center, chpCenter, _queue="chpProcessQueue")

	# Ping for the whole ATOM feed.  We do it here because we only do it once.
	if not os.environ['SERVER_SOFTWARE'].startswith('Development'):
		deferred.defer(pubsubhubbub_publish.publish, 'http://pubsubhubbub.appspot.com', 'http://www.sactraffic.org/atom', _queue="pshPingQueue")

def process_chp_center(chpCenter):
	"""Process a CHP Center.

	"""
	incident_list = []
	psh_pings = []
	dash_re = re.compile(r'\s*-\s*')

	for chpDispatch in chpCenter:
		# For some reason, sometimes the Dispatch ID is blank
		# so skip these.
		if chpDispatch.attrib['ID'] == "":
			continue

		for chpLog in chpDispatch:
			# There are two different time formats in the CHP feed.  Try the
			# "standard" format first, then fall back to the new SAHB format.
			try:
				log_time = datetime.strptime(chpLog.find('LogTime').text, '"%m/%d/%Y %I:%M:%S %p"').replace(tzinfo=tzinfo.Pacific())
			except ValueError:
				log_time = datetime.strptime(chpLog.find('LogTime').text, '"%b %d %Y %I:%M%p"').replace(tzinfo=tzinfo.Pacific())

			key_name = "%s.%s.%s.%d" % (chpCenter.attrib['ID'], chpDispatch.attrib['ID'], chpLog.attrib['ID'], time.mktime(log_time.timetuple()))
			incident = CHPIncident.get_by_key_name(key_name)
			if incident is None:
				incident = CHPIncident(key_name = key_name,
					CenterID = chpCenter.attrib['ID'],
					DispatchID = chpDispatch.attrib['ID'],
					LogID = chpLog.attrib['ID'])

			incident.LogTime = log_time

			(logtypeid, dash, logtype) = chpLog.find('LogType').text.strip('"').partition("-")
			if dash == '':
				# If 'dash' is missing then the hyphen was missing, if so we
				# use the whole thing as the LogType and forget the LogTypeID
				incident.LogType = deCopIfy(re.sub(dash_re, ' - ', logtypeid.strip()))
			else:
				incident.LogType = deCopIfy(re.sub(dash_re, ' - ', logtype.strip()))
				incident.LogTypeID = logtypeid.strip()

			incident.Location = deCopIfy(chpLog.find('Location').text.strip('"'))
			incident.Area = chpLog.find('Area').text.strip('"')
			incident.ThomasBrothers = chpLog.find('ThomasBrothers').text.strip('"')

			# Like the LogTime above, there are now two location formats.
			# This time we try the SAHB LATLON first, then fall back to TBXY.
			try:
				latlon = chpLog.find('LATLON').text.strip('"')
				if latlon != "0:0":
					incident.geolocation = db.GeoPt(
						lat = float(latlon.partition(":")[0]) / 1000000,
						lon = float(latlon.partition(":")[2]) / 1000000 * -1
					)
			except AttributeError:
				incident.TBXY = chpLog.find('TBXY').text.strip('"')
				incident.geolocation = geoConvertTBXY(incident.CenterID, incident.TBXY)

			# Special handling for the LogDetails
			LogDetails = {
				'details': [],
				'units': []
			}
			logdetails_element = chpLog.find('LogDetails')
			for element in logdetails_element:
				try:
					detail_dict = {
						'DetailTime': element.find('DetailTime').text.strip('"'),
						'IncidentDetail': deCopIfy(element.find('IncidentDetail').text.strip('"^')).capitalize()
					}
					LogDetails[element.tag].append(detail_dict)
				except AttributeError:
					pass

			incident.LogDetails = pickle.dumps(LogDetails)

			# Set up the PSH pings.  Note, we are NOT checking for actual
			# changes in the data, we are just assuming that the existance of
			# an incident in the CHP feed declares it as "updated" so we ping.
			psh_pings.append('http://www.sactraffic.org/atom?center=%s' % urllib.quote(incident.CenterID))
			psh_pings.append('http://www.sactraffic.org/atom?dispatch=%s' % urllib.quote(incident.DispatchID))
			psh_pings.append('http://www.sactraffic.org/atom?area=%s' % urllib.quote(incident.Area))
			if incident.city is not None and incident.city != "":
				psh_pings.append('http://www.sactraffic.org/atom?city=%s' % urllib.quote(incident.city))

			# Save this incident
			incident_list.append(incident)

	# Store the incidents in a batch
	db.put(incident_list)

	# Ping the PSH hub, use a set so we don't ping duplicates.
	ping_set = set(psh_pings)
	if not os.environ['SERVER_SOFTWARE'].startswith('Development'):
		deferred.defer(pubsubhubbub_publish.publish, 'http://pubsubhubbub.appspot.com', ping_set, _queue="pshPingQueue")
	else:
		logging.info("Skipping PSH pings for %s on the development server. %s" % (incident.CenterID, ping_set))

	# Reverse geocode the incidents if we haven't already
	for incident in incident_list:
		if incident.city is None and incident.geolocation is not None:
			deferred.defer(reverse_geocode.load_city, incident.key(), _queue="reverseGeocodeQueue")

	logging.info("Processed %d incidents in %s." % (len(incident_list), chpCenter.attrib['ID']))

# Use app cahing and regex compiling
# List of translations available at: http://www.freqofnature.com/frequencies/ca/chpcodes.html
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

	{ 'regex': re.compile(r'\bSR51\b', re.I), 'str': "CAP CITY FWY" },

	{ 'regex': re.compile(r' \/ ', re.I), 'str': " at " },
	{ 'regex': re.compile(r'\bTrfc\b', re.I), 'str': "Traffic" },
	{ 'regex': re.compile(r'\bInj\b', re.I), 'str': "Injury" },
	{ 'regex': re.compile(r'\bEnrt\b', re.I), 'str': "Enroute" },
	{ 'regex': re.compile(r'\bVeh\b', re.I), 'str': "Vehicle" },
	{ 'regex': re.compile(r'\bUnkn\b', re.I), 'str': "Unknown" },
	{ 'regex': re.compile(r'\bUnk\b', re.I), 'str': "Unknown" },

	{ 'regex': re.compile(r'\b1141\b', re.I), 'str': "Ambulance" },

	{ 'regex': re.compile(r'\bRP\b', re.I), 'str': "reporting party" },
	{ 'regex': re.compile(r'\bTC\b', re.I), 'str': "collision" },
	{ 'regex': re.compile(r'\bRHS\b', re.I), 'str': "right hand side" },
	{ 'regex': re.compile(r'\bLHS\b', re.I), 'str': "left hand side" },

	{ 'regex': re.compile(r'^\[\d+\] ', re.I), 'str': "" }
]

def deCopIfy(text):
	"""Translate police jargon to something in English.

	"""
	if text == "":
		return text

	for lingo in coplingo:
		text = re.sub(lingo['regex'], lingo['str'], text)

	return text[0].upper() + text[1:]

def geoConvertTBXY(center, tbxy):
	"""Converts TBXY points to Lat/Long.

	Mostly...

	"""
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
