#!/usr/bin/python

import hashlib
import hmac
import pickle
import urllib2
from xml.etree import ElementTree

print "Fetching CHP data..."
f = urllib2.urlopen("http://media.chp.ca.gov/sa_xml/sa.xml")
chp_data = f.read()

print "  parsing XML"
chp_etree = ElementTree.XML(chp_data)

print "  preparing upload"
pdata = pickle.dumps(chp_etree)

print "  signing"
sig = hmac.new("planet10", pdata, hashlib.sha1).hexdigest()
print "    sig: %s" % sig

print "  uploading"
headers = {
	'X-Signature': sig
}
request = urllib2.Request('http://localhost:8080/update', pdata, headers);
upload = urllib2.urlopen(request)

print "Done."