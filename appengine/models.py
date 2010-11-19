""" Model classes for SacTraffic. """

from datetime import datetime, timedelta

from google.appengine.ext import db


class CHPIncident(db.Model):
	""" Represents a CHP Incident. """
	CenterID = db.StringProperty(required=True)
	DispatchID = db.StringProperty(required=True)
	LogID = db.StringProperty(required=True)
	LogTime = db.DateTimeProperty()
	LogType = db.StringProperty()
	LogTypeID = db.StringProperty()
	Location = db.StringProperty()
	Area = db.StringProperty()
	ThomasBrothers = db.StringProperty()
	TBXY = db.StringProperty()
	LogDetails = db.BlobProperty()
	geolocation = db.GeoPtProperty()
	updated = db.DateTimeProperty(auto_now=True)

	@property
	def status(self):
		if self.LogTime > datetime.utcnow() - timedelta(minutes=5):
			# less than 5 min old == new
			return 'new'
		elif self.updated < datetime.utcnow() - timedelta(minutes=15):
			# not updated in the last 15 min == inactive
			# 15 min assumes 3 misses on a 5 min cron cycle.
			#
			# What I want here is 'not updated w/in 15 min of the last
			# successful update == inactive' but not sure how to get at
			# 'last successful update'
			return 'inactive'
		else:
			# what's left... active
			return 'active'


class Camera(db.Model):
	""" Represents a live camera. """
	name = db.StringProperty()
	url = db.LinkProperty()
	geolocation = db.GeoPtProperty()
	width = db.IntegerProperty()
	height = db.IntegerProperty()
	updated = db.DateTimeProperty(auto_now=True)

