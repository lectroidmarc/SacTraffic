from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from google.appengine.ext.webapp import template

from models import CHPIncident
from utils import tzinfo


class IncidentHandler(webapp.RequestHandler):
	def get(self):
		pacific_tz = tzinfo.Pacific()
		incident = CHPIncident.get_by_key_name(self.request.get("id", default_value='none'))
		if incident is not None:
			template_values = {
				'incident': incident,
				'localLogTime': (incident.LogTime + pacific_tz.utcoffset(incident.LogTime))
			}
		else:
			template_values = {}

		self.response.out.write(template.render("../templates/incident.html", template_values))

	def head(self):
		# App Engine disallows setting of Content-Length, but at the same time
		# won't send a body in response to HEAD requests, so just call get().
		self.get()


application = webapp.WSGIApplication([('/incident', IncidentHandler)],
										 debug=True)

def main():
	util.run_wsgi_app(application)

if __name__ == '__main__':
	main()
