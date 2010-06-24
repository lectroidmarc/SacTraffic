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

		rssroot = ElementTree.Element('rss', {
			'version': '2.0',
			'xmlns:atom': 'http://www.w3.org/2005/Atom',
			'xmlns:georss': 'http://www.georss.org/georss'
		})
		channel = ElementTree.SubElement(rssroot, 'channel')

		ElementTree.SubElement(channel, 'title').text = 'Traffic'
		ElementTree.SubElement(channel, 'link').text = 'http://traffic.lectroid.net'
		ElementTree.SubElement(channel, 'description').text = 'Traffic incidents from the CHP'
		ElementTree.SubElement(channel, 'ttl').text = '5'

		self_href = "http://traffic.lectroid.net/rss"
		query_string = "?" + self.request.environ['QUERY_STRING']
		if query_string != "?":
			self_href += query_string

		ElementTree.SubElement(channel, 'atom:link', {
			'href': self_href,
			'rel': 'self',
			'type': 'application/rss+xml'
		})
		ElementTree.SubElement(channel, 'atom:link', {
			'href': 'http://pubsubhubbub.appspot.com',
			'rel': 'hub'
		})

		for incident in incident_query:
			details = pickle.loads(incident.LogDetails)
			description = incident.Location + ", " + incident.Area + "<ul>"
			for detail in details['details']:
				description += "<li>" + detail['DetailTime'] + ": " + detail['IncidentDetail'] + "</li>"
			description += "</ul>"

			item = ElementTree.SubElement (channel, 'item')

			ElementTree.SubElement(item, 'title').text = incident.LogType
			ElementTree.SubElement(item, 'description').text = description
			ElementTree.SubElement(item, 'pubDate').text = incident.LogTime.strftime("%a, %d %b %Y %H:%M:%S GMT")
			ElementTree.SubElement(item, 'guid', {'isPermaLink': 'false'}).text = incident.LogID
			ElementTree.SubElement(item, 'source', {'url': 'http://media.chp.ca.gov/sa_xml/sa.xml'}).text = "CHP"
			ElementTree.SubElement(item, 'category').text = incident.LogTypeID

			if incident.geolocation is not None:
				ElementTree.SubElement(item, 'georss:point').text = str(incident.geolocation.lat) + " " + str(incident.geolocation.lon)


		self.response.headers["Content-Type"] = "application/rss+xml"
		conditional_http.setConditionalHeaders(self, last_mod)
		self.response.out.write('<?xml version="1.0"?>')	# oh this can't be right!
		self.response.out.write(ElementTree.tostring(rssroot))


application = webapp.WSGIApplication([('/atom', AtomHandler)],
										 debug=True)

def main():
	util.run_wsgi_app(application)

if __name__ == '__main__':
	main()
