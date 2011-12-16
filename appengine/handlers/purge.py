"""Purge handler.

Delete any incidents that have not been updated in over
an hour from the last successful CHP data update.

"""
import webapp2
from datetime import datetime, timedelta

from google.appengine.ext import db

from models import CHPData, CHPIncident


class PurgeHandler(webapp2.RequestHandler):
	def get(self):
		count = 0
		chp_data = CHPData.get_by_key_name("chp_data")

		if chp_data is not None:
			query = CHPIncident.all(keys_only=True)

			query.filter('updated <', CHPData.last_updated() - timedelta(hours=1))
			count = query.count()
			db.delete(query)

		self.response.write("Purged %d records." % count)


application = webapp2.WSGIApplication([('/purge', PurgeHandler)],
										 debug=True)
