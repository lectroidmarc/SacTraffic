""" Warmup handler.  Not much to initialize here."""

from google.appengine.ext import webapp
from google.appengine.ext.webapp import util

class WarmupHandler(webapp.RequestHandler):
	def get(self):
		pass


application = webapp.WSGIApplication([('/_ah/warmup', WarmupHandler)], debug=True)

def main():
	util.run_wsgi_app(application)

if __name__ == '__main__':
	main()