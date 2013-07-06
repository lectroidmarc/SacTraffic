"""Purge handler.

Delete any incidents that have not been updated since the last successful
CHP data update.

"""
import webapp2
from datetime import timedelta

from google.appengine.ext import ndb

from models import CHPData, CHPIncident


class PurgeHandler(webapp2.RequestHandler):
	def get(self):
	  # We need to be careful here.  It's possible this handler could run in the
	  # window between when the CHPData is updated and when the incidents get
	  # updated.  So throw in 5 minutes of padding.
	  #
	  # See also: https://developers.google.com/appengine/docs/python/ndb/#writes
		query = CHPIncident.query(CHPIncident.updated < CHPData.last_updated() - timedelta(minutes=5))
		count = query.count()
		keys = query.fetch(keys_only=True)
		ndb.delete_multi(keys)

		self.response.write("Purged %d records." % count)


application = webapp2.WSGIApplication([('/purge', PurgeHandler)], debug=True)
