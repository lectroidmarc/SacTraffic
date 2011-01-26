#!/usr/bin/python

"""Script used to update the CHP data from a remote system, specifically one without a 10 second timeout."""

import hashlib
import hmac
import json
import pickle
import time
import urllib2
import zlib
from optparse import OptionParser
from xml.etree import ElementTree

parser = OptionParser()
parser.add_option("-d", "--domain", action="store", type="string", dest="upload_domain",
	default="lectroid-sactraffic.appspot.com",
	help="The domain to upload to. (defaults to lectroid-sactraffic.appspot.com)")
parser.add_option("-k", "--key", action="store", type="string", dest="key",
	help="The key to sign this data with. (required)")
parser.add_option("-t", "--time", action="store", type="int", dest="time_delay",
	default=10,
	help="The time, in minutes, to wait before we step in and help. (defaults to 10 minutes)")
(options, args) = parser.parse_args()

# Seriously, we need a key...
if not options.key:
	parser.error("A key is required.")

upload_url = "http://%s/update-helper" % options.upload_domain

# First, see if we need to do anything
try:
	f = urllib2.urlopen(upload_url)
except urllib2.HTTPError:
	sys.exit("App Engine returned a HTTPError on GET.")
info = json.loads(f.read())
minutes = (time.time() - info['last_update']) / 60

if minutes > options.time_delay:
	print "Last native update was over %d minutes ago, helping..." % minutes

	print "  fetching the CHP data..."
	try:
		f = urllib2.urlopen("http://media.chp.ca.gov/sa_xml/sa.xml")
	except urllib2.HTTPError:
		sys.exit("The CHP site returned a HTTPError.")
	chp_data = f.read()

	print "  parsing the XML"
	chp_etree = ElementTree.XML(chp_data)

	print "  preparing upload"
	data = pickle.dumps(chp_etree)

	print "    gzipping"
	zdata = zlib.compress(data)

	print "  signing"
	signature = hmac.new(options.key, zdata, hashlib.sha1).hexdigest()
	print "    sig: %s" % signature

	print "  uploading"
	headers = {
		'X-Signature': signature
	}
	request = urllib2.Request(upload_url, zdata, headers);
	upload = urllib2.urlopen(request)

	print "Done."
else:
	print "Last update was %.2f minutes ago, no need to help." % minutes
