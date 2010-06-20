from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from google.appengine.ext import db
from google.appengine.ext.webapp import template

from models import CHPIncident

from datetime import datetime, timedelta

class PurgeHandler(webapp.RequestHandler):
	def get(self):
		count = 0
		query = CHPIncident.gql("WHERE last_update < :1", datetime.utcnow() - timedelta(hours=6))
		for incident in query:
			count += 1
			incident.delete()

		self.response.out.write(template.render("../templates/purge.html", { 'number': count }))


def main():
	application = webapp.WSGIApplication([('/purge', PurgeHandler)],
										 debug=True)
	util.run_wsgi_app(application)


if __name__ == '__main__':
	main()
