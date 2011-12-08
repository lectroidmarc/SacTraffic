"""Model classes for SacTraffic.

"""

import time

from datetime import datetime, timedelta

from google.appengine.ext import db
from google.appengine.api import memcache

from utils import tzinfo

class CHPData(db.Model):
	"""Holds the last successful CHP data fetch.

	"""
	data = db.BlobProperty(required=True)
	updated = db.DateTimeProperty(auto_now=True)

	def put(self):
		"""Stick the updated date into memcache on put().

		"""
		memcache.set("%s-updated" % self.key().id_or_name(), self.updated)
		db.Model.put(self)

	@classmethod
	def last_updated(cls):
		"""Gets the last updated date of the CHP Data.

		"""
		chp_data_last_updated = memcache.get("chp_data-updated")
		if chp_data_last_updated is None:
			chp_data = cls.get_by_key_name("chp_data")
			if chp_data is not None:
				memcache.add("chp_data-updated", chp_data.updated)
				chp_data_last_updated = chp_data.updated

		return chp_data_last_updated


class CHPIncident(db.Model):
	"""Represents a CHP Incident.

	"""
	CenterID = db.StringProperty(required=True)
	DispatchID = db.StringProperty(required=True)
	LogID = db.StringProperty(required=True)
	LogTime = db.DateTimeProperty()
	LogType = db.StringProperty()
	LogTypeID = db.StringProperty()
	Location = db.StringProperty()
	Area = db.StringProperty()
	ThomasBrothers = db.TextProperty()
	TBXY = db.TextProperty()
	LogDetails = db.BlobProperty()
	geolocation = db.GeoPtProperty()
	city = db.StringProperty()
	updated = db.DateTimeProperty(auto_now=True)

	@property
	def logTimeEpoch(self):
		return int(time.mktime(self.LogTime.timetuple()))

	@property
	def logTimeLocal(self):
		pacific_tz = tzinfo.Pacific()
		return (self.LogTime + pacific_tz.utcoffset(self.LogTime))

	@property
	def status(self):
		if self.LogTime > datetime.utcnow() - timedelta(minutes=5):
			# less than 5 min old == new
			return 'new'

		if self.updated < CHPData.last_updated() - timedelta(minutes=15):
			# not updated w/in 15 min of the last successful update == inactive
			# 15 min assumes 3 misses on a 5 min cron cycle.
			return 'inactive'

		# what's left... active
		return 'active'
