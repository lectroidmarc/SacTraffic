""" Provides a backup mechanism for updating the CHP data since it's sometimes
tough for the CHP servers to respond in the GAE 10 second limit. """

import hashlib
import hmac
import logging
import pickle
import time
import zlib

from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from django.utils import simplejson as json
from google.appengine.runtime.apiproxy_errors import CapabilityDisabledError

from models import CHPData, CHPIncident
from utils.process_chp_data import process_chp_xml
# Note that the keys.py file is NOT included in public scm
from keys import UPLOAD_KEY

class UpdateHelperHandler(webapp.RequestHandler):
	def get(self):
		incidents = CHPIncident.all()
		incidents.order('-updated')
		incident = incidents.get()

		if incident is not None:
			self.response.headers["Content-Type"] = "application/json"
			self.response.out.write(json.dumps({ 'last_update': time.mktime(incident.updated.timetuple()) }))

	def post(self):
		data = self.request.body
		local_sig = hmac.new(UPLOAD_KEY, data, hashlib.sha1).hexdigest()

		if self.request.headers.has_key('X-Signature') and local_sig == self.request.headers['X-Signature']:
			# Yay, a match...
			try:
				CHPData(key_name="chp_data", data=data).put()
			except CapabilityDisabledError:
				logging.warning("Google datastore in read-only mode, not processing CHP data.")
			else:
				chp_etree = pickle.loads(zlib.decompress(data))
				process_chp_xml(chp_etree)
		else:
			# Boo, hiss, no match
			logging.warning("Request signature mismatch.")
			self.response.set_status(401)


application = webapp.WSGIApplication([('/update-helper', UpdateHelperHandler)],
										 debug=True)

def main():
	util.run_wsgi_app(application)


if __name__ == '__main__':
	main()
