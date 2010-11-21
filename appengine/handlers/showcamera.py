
from google.appengine.api import urlfetch
from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from google.appengine.ext.webapp import template

from models import Camera

class CameraHandler(webapp.RequestHandler):
	def get(self):
		camera_id = self.request.get("id")
		camera = Camera.get_by_key_name(camera_id)

		isLarge = False
		if camera.width + 20 >= 468:
			isLarge = True

		template_values = {
			'camera': camera,
			'isLarge': isLarge,
			'pageWidth': camera.width + 60
		}

		self.response.out.write(template.render("../templates/showcamera.html", template_values))


application = webapp.WSGIApplication([('/showcamera', CameraHandler)],
									 debug=True)

def main():
	util.run_wsgi_app(application)

if __name__ == '__main__':
	main()
