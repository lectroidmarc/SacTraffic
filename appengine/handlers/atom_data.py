"""ATOM Handler.

Returns CHP incident data in the ATOM format.

"""
import re
import time
import urllib
import webapp2
from xml.etree import ElementTree

from utils import incident_request


class AtomHandler(incident_request.RequestHandler):
	def get(self):
		self.get_incidents()

		# 304 check
		if self.is_not_modified():
			return

		# Build the ATOM XML
		feed = ElementTree.Element('feed', {
			'xmlns': 'http://www.w3.org/2005/Atom',
			'xmlns:georss': 'http://www.georss.org/georss'
		})

		title = "CHP Traffic Incidents"
		if self.request.get("dispatch") == "SACC":
			title = "SacTraffic: Sacramento Area Traffic Incidents"
		roads = self.request.get("roads")

		# Change this for the West Sac News-Leger since no one appears home there
		if "http://www.westsac.com/news-ledger" in self.request.headers['User-Agent']:
			if roads == "i-5,i-80,i-50,i-99":
				roads = "I5,I80,US50,Hwy 99"

		if roads != "":
			title = "%s (%s)" % (title, roads)

		ElementTree.SubElement(feed, 'title').text = title
		ElementTree.SubElement(feed, 'subtitle').text = 'Traffic incidents from the CHP'
		ElementTree.SubElement(ElementTree.SubElement(feed, 'author'), 'name').text = 'The California Highway Patrol'
		ElementTree.SubElement(feed, 'id').text = 'tag:traffic.lectroid.net,2010-06-24:100'
		ElementTree.SubElement(feed, 'updated').text = self.incidents_last_mod.strftime("%Y-%m-%dT%H:%M:%SZ")

		# site link...
		ElementTree.SubElement(feed, 'link', {
			'href': "http://www.sactraffic.org"
		})

		# self link...
		self_href = "http://%s/atom" % self.request.environ['HTTP_HOST']
		query_string = "?" + self.request.environ['QUERY_STRING']
		if query_string != "?":
			self_href += query_string

		ElementTree.SubElement(feed, 'link', {
			'href': self_href,
			'rel': 'self',
			'type': 'application/atom+xml'
		})

		# pubsubhubbub link...
		# don't show for roads search feeds, since we don't ping for those
		if roads == "":
			ElementTree.SubElement(feed, 'link', {
				'href': 'http://pubsubhubbub.appspot.com',
				'rel': 'hub'
			})

		# logo & icon
		ElementTree.SubElement(feed, 'icon').text = "http://%s/favicon.ico" % self.request.environ['HTTP_HOST']

		for incident in self.incidents:
			if roads != "":
				road_match = re.search(roads.replace(",", "|"), incident.Location, flags=re.I)
				if road_match is None:
					continue

			city = incident.city
			if city is None:
				city = incident.Area
			title = "%s: %s, %s" % (incident.LogType, incident.Location, city)
			details = incident.LogDetails
			description = "<ul>"
			for detail in details['details']:
				description = "%s<li>%s: %s</li>" % (description, detail['DetailTime'], detail['IncidentDetail'])
			description = "%s</ul>" % description

			static_map_url = ""
			if incident.geolocation is not None:
				static_map_opts = urllib.urlencode({
					"size": "200x200",
					"markers": "color:0x165279|%f,%f" % (incident.geolocation.lat, incident.geolocation.lon),
					"zoom": "12",
					"maptype": "roadmap",
					"sensor": "true"
				})
				static_map_url = "http://maps.google.com/maps/api/staticmap?%s" % static_map_opts
				description = '%s<img src="%s" width="200" height="200" border="1"/>' % (description, static_map_url)

			entry = ElementTree.SubElement (feed, 'entry')

			ElementTree.SubElement(entry, 'title').text = title
			ElementTree.SubElement(entry, 'id').text = 'tag:traffic.lectroid.net,2010-11-30:' + incident.LogID
			ElementTree.SubElement(entry, 'content', {'type': 'html'}).text = description
			ElementTree.SubElement(entry, 'published').text = incident.LogTime.strftime("%Y-%m-%dT%H:%M:%SZ")
			ElementTree.SubElement(entry, 'updated').text = incident.updated.strftime("%Y-%m-%dT%H:%M:%SZ")

			if incident.geolocation is not None:
				ElementTree.SubElement(entry, 'link', {'rel': 'enclosure', 'type': 'image/png', 'href': static_map_url})
				ElementTree.SubElement(entry, 'georss:point').text = str(incident.geolocation.lat) + " " + str(incident.geolocation.lon)

			if incident.LogTypeID is not None:
				ElementTree.SubElement(entry, 'category', {'term': incident.LogTypeID})

		# Output
		self.response.headers["Content-Type"] = "application/atom+xml"
		self.send_conditional_headers()

		self.response.write('<?xml version="1.0"?>')	# oh this can't be right!
		self.response.write(ElementTree.tostring(feed))


application = webapp2.WSGIApplication([('/atom', AtomHandler)], debug=True)
