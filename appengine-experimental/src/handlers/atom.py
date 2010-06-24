import pickle
import time

from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from xml.etree import ElementTree

from models import CHPIncident
from utils import conditional_http


class AtomHandler(webapp.RequestHandler):
	def get(self):
		center = self.request.get("center")
		dispatch = self.request.get("dispatch")
		area = self.request.get("area")

		last_mod = conditional_http.getLastMod(self)
		if conditional_http.isNotModified(self, last_mod):
			return

		incident_query = CHPIncident.all()
		incident_query.order('-LogTime')
		if center != "":
			incident_query.filter('CenterID =', center)
		if dispatch != "":
			incident_query.filter('DispatchID =', dispatch)
		if area != "":
			incident_query.filter('Area =', area)

		feed = ElementTree.Element('feed', {
			'xmlns': 'http://www.w3.org/2005/Atom',
			'xmlns:georss': 'http://www.georss.org/georss'
		})

		ElementTree.SubElement(feed, 'title').text = 'Traffic'

		self_href = "http://traffic.lectroid.net/rss"
		query_string = "?" + self.request.environ['QUERY_STRING']
		if query_string != "?":
			self_href += query_string

		ElementTree.SubElement(feed, 'link', {
			'href': self_href,
			'rel': 'self',
			'type': 'application/atom+xml'
		})
		ElementTree.SubElement(feed, 'link', {
			'href': 'http://pubsubhubbub.appspot.com',
			'rel': 'hub'
		})

		for incident in incident_query:
			details = pickle.loads(incident.LogDetails)
			description = incident.Location + ", " + incident.Area + "<ul>"
			for detail in details['details']:
				description += "<li>" + detail['DetailTime'] + ": " + detail['IncidentDetail'] + "</li>"
			description += "</ul>"

			entry = ElementTree.SubElement (feed, 'entry')

			ElementTree.SubElement(entry, 'title').text = incident.LogType
			ElementTree.SubElement(entry, 'description').text = description
			ElementTree.SubElement(entry, 'pubDate').text = incident.LogTime.strftime("%a, %d %b %Y %H:%M:%S GMT")
			ElementTree.SubElement(entry, 'guid', {'isPermaLink': 'false'}).text = incident.LogID
			ElementTree.SubElement(entry, 'source', {'url': 'http://media.chp.ca.gov/sa_xml/sa.xml'}).text = "CHP"
			ElementTree.SubElement(entry, 'category').text = incident.LogTypeID

			if incident.geolocation is not None:
				ElementTree.SubElement(entry, 'georss:point').text = str(incident.geolocation.lat) + " " + str(incident.geolocation.lon)


		self.response.headers["Content-Type"] = "application/atom+xml"
		conditional_http.setConditionalHeaders(self, last_mod)
		self.response.out.write('<?xml version="1.0"?>')	# oh this can't be right!
		self.response.out.write(ElementTree.tostring(feed))


application = webapp.WSGIApplication([('/atom', AtomHandler)],
										 debug=True)

def main():
	util.run_wsgi_app(application)

if __name__ == '__main__':
	main()
