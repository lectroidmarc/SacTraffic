"""Purge handler.

Delete any incidents that have not been updated in over
an hour from the last successful CHP data update.

"""
import webapp2
from datetime import datetime, timedelta

from google.appengine.ext import ndb

from models import CHPData, CHPIncident


class PurgeHandler(webapp2.RequestHandler):
	def get(self):
		count = 0
		chp_data_last_updated = CHPData.last_updated()

		if chp_data_last_updated is not None:
			query = CHPIncident.query().filter(CHPIncident.updated < chp_data_last_updated - timedelta(minutes=15))
			count = query.count()
			keys = query.fetch(keys_only=True)
			ndb.delete_multi(keys)

		self.response.write("Purged %d records." % count)


application = webapp2.WSGIApplication([('/purge', PurgeHandler)], debug=True)
