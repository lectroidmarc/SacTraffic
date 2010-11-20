#!/usr/bin/python

"""
	Simple Closure Compiler API wrapper... in Python.

	Use this by running:

	closure.py -o <output> <file>...

	Where <file> is the JS you want to compress with the Closure Compiler.
	Take care to scan the stderr for errors and warnings as they're specified
	in the query.
"""

import json 
import httplib
import urllib
import sys
from optparse import OptionParser

parser = OptionParser()
parser.add_option("-o", action="store", type="string", dest="output_file",
	default="output.js",
	help="The file to output to.")
(options, args) = parser.parse_args()

# Define the parameters for the POST request and encode them in
# a URL-safe format.

params = [
	('compilation_level', 'SIMPLE_OPTIMIZATIONS'),
	('output_format', 'json'),
	('output_info', 'compiled_code'),
	('output_info', 'warnings'),
	('output_info', 'errors')
	]

for filename in args:
	params.append(('js_code', open(filename).read()))

# Always use the following value for the Content-type header.
headers = { "Content-type": "application/x-www-form-urlencoded" }
conn = httplib.HTTPConnection('closure-compiler.appspot.com')
conn.request('POST', '/compile', urllib.urlencode(params), headers)
response = conn.getresponse()
data = json.loads(response.read())
conn.close

if 'errors' in data:
	for error in data['errors']:
		sys.stderr.write("%s: %s, %s\n" % (error['lineno'], error['type'], error['error']))
elif 'warnings' in data:
	for warning in data['warnings']:
		sys.stderr.write("%s: %s, %s\n" % (warning['lineno'], warning['type'], warning['warning']))

f = open(options.output_file, "w")
f.write(data['compiledCode'])
