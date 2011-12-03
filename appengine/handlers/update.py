import logging
import pickle
import zlib
from datetime import datetime, timedelta
from xml.etree import ElementTree

from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from google.appengine.api import urlfetch
from google.appengine.ext import db
from google.appengine.runtime.apiproxy_errors import CapabilityDisabledError

from models import CHPData, CHPIncident
from utils import process_chp_data


class UpdateHandler(webapp.RequestHandler):
	def get(self):
		output_blurb = "CHP Incidents loaded."

		try:
			result = urlfetch.fetch("http://media.chp.ca.gov/sa_xml/sa.xml", deadline=60)
		except urlfetch.DownloadError:
			error = "DownloadError. CHP request took too long."
			logging.warning(error)
			output_blurb = error
		else:
			if result.status_code == 200:
				try:
					chp_etree = ElementTree.XML(result.content)
				except ElementTree.ParseError, e:
					error = "XML processing error. %s" % e.message
					logging.warning(error)
					output_blurb = error
				else:
					try:
						CHPData(key_name="chp_data", data=zlib.compress(pickle.dumps(chp_etree))).put()
					except CapabilityDisabledError:
						error = "Google datastore in read-only mode, not processing CHP data."
						logging.warning(error)
						output_blurb = error
					else:
						process_chp_data.process_chp_xml(chp_etree)
			else:
				error = "CHP server returned " + str(result.status_code) + " status."
				logging.warning(error)
				output_blurb = error

		self.response.out.write(output_blurb)


application = webapp.WSGIApplication([('/update', UpdateHandler)],
										 debug=True)

def main():
	util.run_wsgi_app(application)


if __name__ == '__main__':
	main()
