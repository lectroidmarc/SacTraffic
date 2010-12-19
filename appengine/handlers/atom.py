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
			last_mod = max(incidents, key=lambda incident: incident.updated).updated
			if conditional_http.isNotModified(self, last_mod):
				return

		feed = ElementTree.Element('feed', {
			'xmlns': 'http://www.w3.org/2005/Atom',
			'xmlns:georss': 'http://www.georss.org/georss'
		})

		title = "CHP Traffic Incidents"
		if dispatch == "STCC":
			title = "SacTraffic: Sacramento Area Traffic Incidents"
		if roads != "":
			title = "%s (%s)" % (title, roads)

		ElementTree.SubElement(feed, 'title').text = title
		ElementTree.SubElement(feed, 'subtitle').text = 'Traffic incidents from the CHP'
		ElementTree.SubElement(ElementTree.SubElement(feed, 'author'), 'name').text = 'The California Highway Patrol'
		ElementTree.SubElement(feed, 'id').text = 'tag:traffic.lectroid.net,2010-06-24:100'
		ElementTree.SubElement(feed, 'updated').text = last_mod.strftime("%Y-%m-%dT%H:%M:%SZ")

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
		ElementTree.SubElement(feed, 'logo').text = "http://%s/images/sactraffic.png" % self.request.environ['HTTP_HOST']
		ElementTree.SubElement(feed, 'icon').text = "http://%s/favicon.ico" % self.request.environ['HTTP_HOST']

		for incident in incidents:
			if roads != "":
				road_match = re.search(roads.replace(",", "|"), incident.Location, flags=re.I)
				if road_match is None:
					continue

			title = "%s: %s, %s" % (incident.LogType, incident.Location, incident.Area)
			details = pickle.loads(incident.LogDetails)
			description = "<ul>"
			for detail in details['details']:
				description = "%s<li>%s: %s</li>" % (description, detail['DetailTime'], detail['IncidentDetail'])
			description = "%s</ul>" % description

			static_map_url = ""
			if incident.geolocation is not None:
				static_map_url = "http://maps.google.com/maps/api/staticmap?size=200x200&markers=color:0x165279|%f,%f&zoom=12&maptype=roadmap&sensor=false&style=feature:landscape|lightness:100&style=feature:road.highway|element:geometry|hue:0xff0000|saturation:-25&style=feature:landscape|lightness:100&style=feature:road.arterial|element:geometry|saturation:-100|visibility:simplified&style=feature:road.arterial|element:labels|saturation:-100|lightness:10" % (incident.geolocation.lat, incident.geolocation.lon)
				description = '%s<img src="%s" width="200" height="200" border="1"/>' % (description, static_map_url)

			entry = ElementTree.SubElement (feed, 'entry')

			ElementTree.SubElement(entry, 'title').text = title
			ElementTree.SubElement(entry, 'id').text = 'tag:traffic.lectroid.net,2010-11-30:' + incident.LogID
			ElementTree.SubElement(entry, 'content', {'type': 'html'}).text = description
			ElementTree.SubElement(entry, 'published').text = incident.LogTime.strftime("%Y-%m-%dT%H:%M:%SZ")
			ElementTree.SubElement(entry, 'updated').text = incident.updated.strftime("%Y-%m-%dT%H:%M:%SZ")

			ElementTree.SubElement(entry, 'link', {
				'href': "http://%s/incident?id=%s" % (self.request.environ['HTTP_HOST'], incident.key().name())
			})

			if incident.geolocation is not None:
				ElementTree.SubElement(entry, 'link', {'rel': 'enclosure', 'type': 'image/png', 'href': static_map_url})
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
