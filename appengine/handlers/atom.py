import datetime
import pickle
import re
import time
from xml.etree import ElementTree

from google.appengine.ext import webapp
from google.appengine.ext.webapp import util

from models import CHPIncident
from utils import conditional_http


class AtomHandler(webapp.RequestHandler):
	def get(self):
		center = self.request.get("center")
		dispatch = self.request.get("dispatch", default_value="STCC")
		area = self.request.get("area")
		roads = self.request.get("roads")

		incidents = CHPIncident.all()
		incidents.order('-LogTime')
		if center != "":
			incidents.filter('CenterID =', center)
		if dispatch != "":
			incidents.filter('DispatchID =', dispatch)
		if area != "":
			incidents.filter('Area =', area)

		last_mod = datetime.datetime.utcnow()
		if incidents.count(1) > 0:
			last_mod = max(incidents, key=lambda incident: incident.modified).modified
			if conditional_http.isNotModified(self, last_mod):
				return

		feed = ElementTree.Element('feed', {
			'xmlns': 'http://www.w3.org/2005/Atom',
			'xmlns:georss': 'http://www.georss.org/georss'
		})

		ElementTree.SubElement(feed, 'title').text = 'Traffic'
		ElementTree.SubElement(feed, 'subtitle').text = 'Traffic incidents from the CHP'
		ElementTree.SubElement(ElementTree.SubElement(feed, 'author'), 'name').text = 'The California Highway Patrol'
		ElementTree.SubElement(feed, 'id').text = 'tag:traffic.lectroid.net,2010-06-24:100'
		ElementTree.SubElement(feed, 'updated').text = last_mod.strftime("%Y-%m-%dT%H:%M:%SZ")

		# self link...
		self_href = "http://traffic.lectroid.net/atom"
		query_string = "?" + self.request.environ['QUERY_STRING']
		if query_string != "?":
			self_href += query_string

		ElementTree.SubElement(feed, 'link', {
			'href': self_href,
			'rel': 'self',
			'type': 'application/atom+xml'
		})

		# pubsubhubbub link...
		ElementTree.SubElement(feed, 'link', {
			'href': 'http://pubsubhubbub.appspot.com',
			'rel': 'hub'
		})

		for incident in incidents:
			if roads != "":
				road_match = re.match(roads.replace(",", "|"), incident.Location, flags=re.I)
				if road_match is None:
					continue

			details = pickle.loads(incident.LogDetails)
			description = "%s, %s<ul>" % (incident.Location, incident.Area)
			for detail in details['details']:
				description += "<li>" + detail['DetailTime'] + ": " + detail['IncidentDetail'] + "</li>"
			description += "</ul>"

			entry = ElementTree.SubElement (feed, 'entry')

			ElementTree.SubElement(entry, 'title').text = incident.LogType
			ElementTree.SubElement(entry, 'id').text = 'tag:traffic.lectroid.net,2010-06-24:' + incident.LogID
			ElementTree.SubElement(entry, 'content', {'type': 'html'}).text = description
			ElementTree.SubElement(entry, 'published').text = incident.LogTime.strftime("%Y-%m-%dT%H:%M:%SZ")
			ElementTree.SubElement(entry, 'updated').text = incident.modified.strftime("%Y-%m-%dT%H:%M:%SZ")

			ElementTree.SubElement(entry, 'link', {
				'href': "/incident?id=%s" % incident.LogID
			})

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
