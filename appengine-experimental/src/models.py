from google.appengine.ext import db
from datetime import datetime, timedelta

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
	added = db.DateTimeProperty(auto_now_add=True)
	last_update = db.DateTimeProperty(auto_now=True)

	def getStatus(self):
		if self.added > datetime.utcnow() - timedelta(minutes=5):
			# less than 5 min old == new
			return 'new'
		elif self.last_update < datetime.utcnow() - timedelta(minutes=5):
			# not updated in 5 min == inactive
			return 'inactive'
		else:
			return 'active'
