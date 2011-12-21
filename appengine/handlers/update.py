"""Update handler.

Fetches the CHP data from their media XML and parses it with Etree.  If it
parses OK then it gets passed to a deferred processor.

"""
import webapp2

from utils import process_chp_data


class UpdateHandler(webapp2.RequestHandler):
	def get(self):
		self.response.write(process_chp_data.update_chp_data())


application = webapp2.WSGIApplication([('/update', UpdateHandler)], debug=True)
