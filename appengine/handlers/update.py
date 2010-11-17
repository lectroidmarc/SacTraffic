import logging
import pickle
from datetime import datetime, timedelta
from xml.etree import ElementTree

from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from google.appengine.api import urlfetch
from google.appengine.ext import db
from google.appengine.ext.webapp import template

from models import CHPIncident
from utils.process_chp_data import process_chp_xml


class UpdateHandler(webapp.RequestHandler):
	def get(self):
		template_values = {}

		try:
			result = urlfetch.fetch("http://media.chp.ca.gov/sa_xml/sa.xml", deadline=10)
		except urlfetch.DownloadError:
			error = "DownloadError. CHP request took too long."
			logging.warning(error)
			template_values['error'] = error

			touchActiveIncidents()
		else:
			if result.status_code == 200:
				try:
					chp_etree = ElementTree.XML(result.content)
				except ElementTree.ExpatError, e:
					error = "XML processing error. %s" % e.message
					logging.warning(error)
					template_values['error'] = error

					touchActiveIncidents()
				else:
					process_chp_xml(chp_etree)
			else:
				error = "CHP server returned " + str(result.status_code) + " status."
				logging.warning(error)
				template_values['error'] = error

				touchActiveIncidents()

		self.response.out.write(template.render("../templates/update.html", template_values))


def touchActiveIncidents():
	# This is called in an error state.  Roll through and "touch" any active
	# incidents (i.e.: any incidents updated < 15 minutes ago) so they stay
	# active.
	active_incidents = CHPIncident.gql("WHERE updated > :1", datetime.utcnow() - timedelta(minutes=15))
	db.put(active_incidents)


application = webapp.WSGIApplication([('/update', UpdateHandler)],
										 debug=True)

def main():
	util.run_wsgi_app(application)


if __name__ == '__main__':
	main()
