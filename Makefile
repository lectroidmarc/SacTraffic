#
# Generic Makefile for minified (and possibly aggregated) JavaScript
#

.SUFFIXES: .js .min.js .css .min.css
.PHONY: clean jsdoc

YUICOMP = java -jar support/yuicompressor-2.4.7.jar
CLOSURE = java -jar support/closure-compiler.jar
JSDOC = ../jsdoc/jsdoc

FILES = appengine/static/sactraffic.min.js \
	appengine/static/sactraffic.min.css \

JS = appengine/static/src/javascript/array.js \
	appengine/static/src/javascript/date.js \
	appengine/static/src/javascript/incident.js \
	appengine/static/src/javascript/incidentlist.js \
	appengine/static/src/javascript/trafficmap.js \
	appengine/static/src/javascript/sactraffic.js

CSS = appengine/static/src/stylesheets/main.css \
	appengine/static/src/stylesheets/button.css \
	appengine/static/src/stylesheets/fontello.css


all: ${FILES}

appengine/static/sactraffic.min.js: ${JS}
	${CLOSURE} --js_output_file $@ --js $^

appengine/static/sactraffic.min.css: ${CSS}
	cat $^ | ${YUICOMP} -o $@ --type css

jsdoc:
	${JSDOC} -p -c support/jsdoc.json --destination jsdoc

clean:
	rm -f ${FILES}
	rm -fr jsdoc
