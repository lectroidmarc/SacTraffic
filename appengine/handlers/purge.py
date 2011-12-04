"""Purge handler.

Delete any incidents that have not been updated in over
6 hours from the last successful CHP data update.

"""
from datetime import datetime, timedelta

from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from google.appengine.ext import db

from models import CHPData, CHPIncident


class PurgeHandler(webapp.RequestHandler):
	def get(self):
		count = 0
		chp_data = CHPData.get_by_key_name("chp_data")

		if chp_data is not None:
			query = CHPIncident.all(keys_only=True)

			query.filter('updated <', CHPData.last_updated() - timedelta(hours=6))
			count = query.count()
			db.delete(query)

		self.response.out.write("Purged %d records." % count)


application = webapp.WSGIApplication([('/purge', PurgeHandler)],
										 debug=True)

def main():
	util.run_wsgi_app(application)

if __name__ == '__main__':
	main()
