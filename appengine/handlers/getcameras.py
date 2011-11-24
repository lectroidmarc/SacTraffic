
import datetime

from google.appengine.dist import use_library
use_library('django', '1.2')

from google.appengine.api import memcache
from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from django.utils import simplejson as json

from models import Camera
from utils import conditional_http


class CameraHandler(webapp.RequestHandler):
	def get(self):
		# Try the 304 stuff from memcache
		last_mod = memcache.get("cameras-last_mod")
		if conditional_http.isNotModified(self, last_mod):
			return

		# Try the JSON from memcache
		json_data = memcache.get("cameras-json")
		if json_data is None:
			# Hit the DS
			cameras = Camera.all()
			cameras.filter('is_online', True)

			last_mod = datetime.datetime.utcnow()
			if cameras.count(1) > 0:
				# Get the last_mod date from the DS data, save it and try the 304 stuff again.
				last_mod = max(cameras, key=lambda camera: camera.updated).updated
				memcache.set("cameras-last_mod", last_mod, 300)
				if conditional_http.isNotModified(self, last_mod):
					return

			output_list = []
			for camera in cameras:
				camera_dict = {
					'id': camera.key().name(),
					'name': camera.name,
					'url': camera.url,
					'location': {
						'lat': camera.geolocation.lat,
						'lon': camera.geolocation.lon
					},
					'size': {
						'width': camera.width,
						'height': camera.height
					}
				}
				output_list.append(camera_dict)

			json_data = json.dumps(output_list, sort_keys=True)
			memcache.set("cameras-json", json_data, 300)

		self.response.headers["Content-Type"] = "application/json"
		conditional_http.setConditionalHeaders(self, last_mod)
		self.response.out.write(json_data)


application = webapp.WSGIApplication([('/getcameras', CameraHandler)],
										 debug=True)

def main():
	util.run_wsgi_app(application)

if __name__ == '__main__':
	main()
