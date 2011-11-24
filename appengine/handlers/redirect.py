from google.appengine.ext import webapp
from google.appengine.ext.webapp import util


class RedirectRSSHandler(webapp.RequestHandler):
	def get(self):
		atom_link = "/atom"

		roads = self.request.get("f")
		if roads != "":
			atom_link = "/atom?roads=%s" % roads

		self.redirect(atom_link, permanent=True)

class RedirectJSONHandler(webapp.RequestHandler):
	def get(self):
		self.redirect("/json?dispatch=STCC", permanent=True)

class RedirectIncidentHandler(webapp.RequestHandler):
	def get(self):
		self.redirect("/incident?id=%s" % self.request.get("id"), permanent=True)


application = webapp.WSGIApplication([
									('/rss.php', RedirectRSSHandler),
									('/json/STCC-STCC.json', RedirectJSONHandler),
									('/incident.html', RedirectIncidentHandler),
									('/incident.php', RedirectIncidentHandler),
									],
										 debug=True)

def main():
	util.run_wsgi_app(application)

if __name__ == '__main__':
	main()
