"""Functions for processing the CHP data.

"""
import logging
import cPickle as pickle
import os
import re
import time
import urllib
from datetime import datetime, timedelta
from xml.etree import ElementTree

from google.appengine.api import urlfetch
from google.appengine.ext import ndb
from google.appengine.ext import deferred

from models import CHPData, CHPIncident
from utils import tzinfo, reverse_geocode
from thirdparty import pubsubhubbub_publish

# Work around an App Engine bug with datetime.strptime
import _strptime


debug = os.environ.get('SERVER_SOFTWARE', '').startswith('Dev')

def update_chp_data():
	"""Fetch the CHP data from the CHP and parse it.  If it parses OK, defer
	processing of each CHP Center.

	"""
	notice = "CHP Incidents loaded."

	try:
		result = urlfetch.fetch("http://media.chp.ca.gov/sa_xml/sa.xml", deadline=60)
	except urlfetch.DownloadError as notice:
		logging.warning(notice)
	else:
		if result.status_code == 200:
			try:
				chp_etree = ElementTree.XML(result.content)
			except ElementTree.ParseError as e:
				notice = "XML processing error. %s" % e.message
				logging.warning(notice)
			else:
				# Store the raw CHP data.  Mostly so we have a marker of the last
				# successful update.
				CHPData.save_chp_data(chp_etree);

				# Now, finally, we process the CHP tree, breaking out each CHP
				# center and deferring its processing
				for chp_center in chp_etree:
					deferred.defer(process_chp_center, chp_center, _queue="chpProcessQueue")

				# Ping for the whole ATOM feed.  We do it here because we only do it once.
				if not debug:
					deferred.defer(pubsubhubbub_publish.publish, 'http://pubsubhubbub.appspot.com', 'http://www.sactraffic.org/atom', _queue="pshPingQueue")
		else:
			notice = "CHP server returned " + str(result.status_code) + " status."
			logging.warning(notice)

	return notice

def process_chp_center(chpCenter):
	"""Process a CHP Center.

	"""
	incident_list = []
	psh_pings = []
	dash_re = re.compile(r'\s*-\s*')

	center_id = chpCenter.attrib['ID']

	for chpDispatch in chpCenter:
		dispatch_id = chpDispatch.attrib['ID']

		# For some reason, sometimes the Dispatch ID is blank so skip these.
		if dispatch_id == "":
			continue

		for chpLog in chpDispatch:
			log_id = chpLog.attrib['ID']

			# There are two different time formats in the CHP feed.  Try the
			# "standard" format first, then fall back to the new SAHB format.
			try:
				log_time = datetime.strptime(chpLog.find('LogTime').text, '"%m/%d/%Y %I:%M:%S %p"')
			except ValueError:
				log_time = datetime.strptime(chpLog.find('LogTime').text, '"%b %d %Y %I:%M%p"')

			# Duct tape to get the timezone right
			pacific_tz = tzinfo.Pacific()
			log_time = log_time - pacific_tz.utcoffset(log_time)

			incident_key_name = "%s.%s.%s" % (center_id, dispatch_id, log_id)
			incident_key = ndb.Key(CHPIncident, incident_key_name)

			incident = incident_key.get()
			if incident is None:
				incident = CHPIncident(key = incident_key,
					CenterID = center_id,
					DispatchID = dispatch_id,
					LogID = log_id,
					LogTime = log_time,
					Area = chpLog.find('Area').text.strip('"'))

			#
			# THe following are attributes that can change between updates so reset
			# them from the data given.
			#

			# LogType and LogTypeID
			(logtypeid, dash, logtype) = chpLog.find('LogType').text.strip('"').partition("-")
			if dash == '':
				# If 'dash' is missing then the hyphen was missing, if so we
				# use the whole thing as the LogType and forget the LogTypeID
				incident.LogType = deCopIfy(re.sub(dash_re, ' - ', logtypeid.strip()))
			else:
				incident.LogType = deCopIfy(re.sub(dash_re, ' - ', logtype.strip()))
				incident.LogTypeID = logtypeid.strip()

			# Location
			incident.Location = deCopIfy(chpLog.find('Location').text.strip('"'))

			# LocationDesc
			# Make sure the location and the locationDesc aren't dupes
			locationDesc = deCopIfy(chpLog.find('LocationDesc').text.strip('"'))
			if (incident.Location.upper() != locationDesc.upper()):
				incident.LocationDesc = locationDesc

			# geolocation
			latlon = chpLog.find('LATLON').text.strip('"')
			if latlon is not None and latlon != "0:0":
				incident.geolocation = ndb.GeoPt(
					lat = float(latlon.partition(":")[0]) / 1000000,
					lon = float(latlon.partition(":")[2]) / 1000000 * -1
				)

			# LogDetails
			LogDetails = {
				'details': []
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
			incident.LogDetails = LogDetails

			# Set up the PSH pings.  Note, we are NOT checking for actual
			# changes in the data, we are just assuming that the existance of
			# an incident in the CHP feed declares it as "updated" so we ping.
			psh_pings.append('http://www.sactraffic.org/atom?center=%s' % urllib.quote(incident.CenterID))
			psh_pings.append('http://www.sactraffic.org/atom?dispatch=%s' % urllib.quote(incident.DispatchID))
			if incident.Area is not None and incident.Area != "":
				psh_pings.append('http://www.sactraffic.org/atom?area=%s' % urllib.quote(incident.Area))
			if incident.city is not None and incident.city != "":
				psh_pings.append('http://www.sactraffic.org/atom?city=%s' % urllib.quote(incident.city.encode('utf8')))

			# Save this incident
			incident_list.append(incident)

	# Store the incidents in a batch
	ndb.put_multi(incident_list)

	# Ping the PSH hub, use a set so we don't ping duplicates.
	ping_set = set(psh_pings)
	if not debug:
		deferred.defer(pubsubhubbub_publish.publish, 'http://pubsubhubbub.appspot.com', ping_set, _queue="pshPingQueue")
	else:
		logging.info("Skipping PSH pings for %s on the development server. %s" % (incident.CenterID, ping_set))

	if center_id == 'SAHB':
		# Limit reverse geocoding to only the SAHB center to limit the number of
		# requests to the geocoder, we are _Sac_ Traffic after all.

		# Reverse geocode the incidents if we haven't already
		for incident in incident_list:
			if incident.city is None and incident.geolocation is not None:
				if not debug:
					deferred.defer(reverse_geocode.load_city, incident, _queue="reverseGeocodeQueue")
				else:
					logging.info("Skipping reverse geocode for %s on the development server." % (incident.Area))

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
	{ 'regex': re.compile(r'\bBETW\b', re.I), 'str': "between" },

	{ 'regex': re.compile(r'\bAT\b', re.I), 'str': "at" },
	{ 'regex': re.compile(r'\bON\b', re.I), 'str': "on" },
	{ 'regex': re.compile(r'\bTO\b', re.I), 'str': "to" },

	{ 'regex': re.compile(r'\bSR51\b', re.I), 'str': "CAP CITY FWY" },
	{ 'regex': re.compile(r'\b(Mm|Sr)\s*(\d+)\b', re.I), 'str': r'Hwy \2' },

	{ 'regex': re.compile(r' \/ ', re.I), 'str': " at " },
	{ 'regex': re.compile(r'\bTrfc\b', re.I), 'str': "Traffic" },
	{ 'regex': re.compile(r'\bInj\b', re.I), 'str': "Injury" },
	{ 'regex': re.compile(r'\bEnrt\b', re.I), 'str': "Enroute" },
	{ 'regex': re.compile(r'\bVeh\b', re.I), 'str': "Vehicle" },
	{ 'regex': re.compile(r'\bUnkn\b', re.I), 'str': "Unknown" },
	{ 'regex': re.compile(r'\bUnk\b', re.I), 'str': "Unknown" },
	{ 'regex': re.compile(r'\brdwy\b', re.I), 'str': "Roadway" },

	{ 'regex': re.compile(r'\btoyt\b', re.I), 'str': "Toyota" },
	{ 'regex': re.compile(r'\bniss\b', re.I), 'str': "Nissan" },
	{ 'regex': re.compile(r'\bchev\b', re.I), 'str': "Chevy" },

	{ 'regex': re.compile(r'\bsil\b', re.I), 'str': "silver" },
	{ 'regex': re.compile(r'\bwhi\b', re.I), 'str': "white" },
	{ 'regex': re.compile(r'\bblk\b', re.I), 'str': "black" },

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

	if text == "":
		return text
	else:
		return text[0].upper() + text[1:]
