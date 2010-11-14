from datetime import datetime, timedelta

from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from google.appengine.ext.webapp import template
from google.appengine.ext import db

from models import CHPIncident


class PurgeHandler(webapp.RequestHandler):
	def get(self):
		query = CHPIncident.all(keys_only=True)
		query.filter('updated <', datetime.utcnow() - timedelta(hours=6))
		count = query.count()
		db.delete(query)

		self.response.out.write(template.render("../templates/purge.html", { 'number': count }))


application = webapp.WSGIApplication([('/purge', PurgeHandler)],
										 debug=True)

def main():
	util.run_wsgi_app(application)

if __name__ == '__main__':
	main()
