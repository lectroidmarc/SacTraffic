"""Model classes for SacTraffic.

"""

import time
import zlib

from datetime import datetime, timedelta

from google.appengine.ext import ndb

from utils import tzinfo

class CHPData(ndb.Model):
	"""Holds the last successful CHP data fetch.

	"""
	data = ndb.PickleProperty(required=True, compressed=True)
	updated = ndb.DateTimeProperty(auto_now=True)

	@classmethod
	def save_chp_data(cls, chp_data):
		"""Store the last raw CHP data successfully fetched.

		"""
		chp_data_key = ndb.Key(cls, 'chp_data')
		CHPData(key=chp_data_key, data=chp_data).put()

	@classmethod
	def last_updated(cls):
		"""Gets the last updated date of the CHP Data.

		"""
		chp_data_key = ndb.Key(cls, 'chp_data')
		chp_data = chp_data_key.get()
		if chp_data is not None:
			return chp_data.updated
		else:
			return datetime.now()


class CHPIncident(ndb.Model):
	"""Represents a CHP Incident.

	"""
	CenterID = ndb.StringProperty(required=True)
	DispatchID = ndb.StringProperty(required=True)
	LogID = ndb.StringProperty(required=True)
	LogTime = ndb.DateTimeProperty()
	LogType = ndb.StringProperty()
	LogTypeID = ndb.StringProperty()
	Location = ndb.TextProperty()
	LocationDesc = ndb.TextProperty()
	Area = ndb.StringProperty()
	LogDetails = ndb.PickleProperty(compressed=True)
	geolocation = ndb.GeoPtProperty()
	city = ndb.StringProperty()
	updated = ndb.DateTimeProperty(auto_now=True)

	@property
	def logTimeEpoch(self):
		return int(time.mktime(self.LogTime.timetuple()))

	@property
	def logTimeLocal(self):
		pacific_tz = tzinfo.Pacific()
		return (self.LogTime + pacific_tz.utcoffset(self.LogTime))
