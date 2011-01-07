import logging
import pickle
import zlib
from datetime import datetime, timedelta
from xml.etree import ElementTree

from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from google.appengine.api import urlfetch
from google.appengine.ext import db
from google.appengine.ext.webapp import template
from google.appengine.runtime.apiproxy_errors import CapabilityDisabledError

from models import CHPData, CHPIncident
from utils.process_chp_data import process_chp_xml


class UpdateHandler(webapp.RequestHandler):
	def get(self):
		template_values = {}

		try:
			result = urlfetch.fetch("http://media.chp.ca.gov/sa_xml/sa.xml", deadline=60)
		except urlfetch.DownloadError:
			error = "DownloadError. CHP request took too long."
			logging.warning(error)
			template_values['error'] = error
		else:
			if result.status_code == 200:
				try:
					chp_etree = ElementTree.XML(result.content)
				except ElementTree.ParseError, e:
					error = "XML processing error. %s" % e.message
					logging.warning(error)
					template_values['error'] = error
				else:
					try:
						CHPData(key_name="chp_data", data=zlib.compress(pickle.dumps(chp_etree))).put()
					except CapabilityDisabledError:
						error = "Google datastore in read-only mode, not processing CHP data."
						logging.warning(error)
						template_values['error'] = error
					else:
						process_chp_xml(chp_etree)
			else:
				error = "CHP server returned " + str(result.status_code) + " status."
				logging.warning(error)
				template_values['error'] = error

		self.response.out.write(template.render("../templates/update.html", template_values))


application = webapp.WSGIApplication([('/update', UpdateHandler)],
										 debug=True)

def main():
	util.run_wsgi_app(application)


if __name__ == '__main__':
	main()
