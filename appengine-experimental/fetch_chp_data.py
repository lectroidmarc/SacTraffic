#!/usr/bin/python

import hashlib
import hmac
import pickle
import urllib2
import zlib
from optparse import OptionParser
from xml.etree import ElementTree

parser = OptionParser()
parser.add_option("-k", action="store", type="string", dest="key",
	help="The key to sign this data with. (required)")
parser.add_option("-z", action="store_true", dest="gzip",
	default=False,
	help="If the data should be gzipped.")
parser.add_option("-u", action="store", type="string", dest="upload_url",
	default="http://traffic.lectroid.net/update",
	help="URL to upload to.")
(options, args) = parser.parse_args()

# Seriously, we need a key...
if not options.key:
	parser.error("A key is required.")


print "Fetching CHP data..."
f = urllib2.urlopen("http://media.chp.ca.gov/sa_xml/sa.xml")
chp_data = f.read()

print "  parsing XML"
chp_etree = ElementTree.XML(chp_data)

print "  preparing upload"
data = pickle.dumps(chp_etree)

if options.gzip:
	print "    gzipping"
	data = zlib.compress(data)

print "  signing"
signature = hmac.new(options.key, data, hashlib.sha1).hexdigest()
print "    sig: %s" % signature

print "  uploading"
headers = {
	'X-Signature': signature
}
request = urllib2.Request(options.upload_url, data, headers);
upload = urllib2.urlopen(request)

print "Done."
