from google.appengine.api import memcache
from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from django.utils import simplejson as json

from models import Camera


class CameraHandler(webapp.RequestHandler):
	def get(self):
		#XXX Bah, needs 304 stuff.  Needs updated in DS, stupid bulkloader
		json_data = memcache.get("camera_json")
		if json_data is None:
			cameras = Camera.all()

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
			memcache.set("camera_json", json_data, 3600)

		self.response.headers["Content-Type"] = "application/json"
		self.response.out.write(json_data)


application = webapp.WSGIApplication([('/getcameras', CameraHandler)],
										 debug=True)

def main():
	util.run_wsgi_app(application)

if __name__ == '__main__':
	main()
