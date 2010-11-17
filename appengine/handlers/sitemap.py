import datetime

from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from google.appengine.ext.webapp import template
from google.appengine.ext import db

from models import Camera, CHPIncident


class SitemapHandler(webapp.RequestHandler):
	def get(self):
		incidents = CHPIncident.all()
		incidents.filter('DispatchID', 'STCC')

		last_mod = datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
		if incidents.count(1) > 0:
			last_mod = max(incidents, key=lambda incident: incident.updated).updated.strftime("%Y-%m-%dT%H:%M:%SZ")

		cameras = Camera.all(keys_only=True)

		template_values = {
			'last_mod': last_mod,
			'incidents': incidents,
			'cameras': cameras
		}

		self.response.headers["Content-Type"] = "text/xml"
		self.response.out.write(template.render("../templates/sitemap.xml", template_values))


application = webapp.WSGIApplication([('/sitemap', SitemapHandler)],
										 debug=True)

def main():
	util.run_wsgi_app(application)

if __name__ == '__main__':
	main()
