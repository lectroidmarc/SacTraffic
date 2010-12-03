from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from google.appengine.ext.webapp import template

from models import CHPIncident


class IncidentHandler(webapp.RequestHandler):
	def get(self):
		incident = CHPIncident.get_by_key_name(self.request.get("id", default_value='none'))
		if incident is not None:
			template_values = {
				'incident': incident
			}
		else:
			template_values = {}

		self.response.out.write(template.render("../templates/incident.html", template_values))


application = webapp.WSGIApplication([('/incident', IncidentHandler)],
										 debug=True)

def main():
	util.run_wsgi_app(application)

if __name__ == '__main__':
	main()
