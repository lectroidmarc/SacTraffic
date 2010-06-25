from datetime import datetime, timedelta

from google.appengine.ext import db


class CHPIncident(db.Model):
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
	created = db.DateTimeProperty(auto_now_add=True)
	updated = db.DateTimeProperty(auto_now=True)
	modified = db.DateTimeProperty()

	def getStatus(self):
		if self.created > datetime.utcnow() - timedelta(minutes=5):
			# less than 5 min old == new
			return 'new'
		elif self.updated < datetime.utcnow() - timedelta(minutes=5):
			# not updated in 5 min == inactive
			return 'inactive'
		else:
			return 'active'
