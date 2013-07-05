#
# Generic Makefile for minified (and possibly aggregated) JavaScript
#

.SUFFIXES: .js .min.js .css .min.css
.PHONY: clean

YUICOMP = java -jar support/yuicompressor-2.4.7.jar
CLOSURE = java -jar support/closure-compiler.jar

FILES = appengine/static/javascript/sactraffic.min.js \
	appengine/static/stylesheets/sactraffic.min.css \

JS = appengine/static/src/javascript/date.js \
	appengine/static/src/javascript/incident.js \
	appengine/static/src/javascript/incidentlist.js \
	appengine/static/src/javascript/requestargs.js \
	appengine/static/src/javascript/trafficmap.js \
	appengine/static/src/javascript/trafficnews.js \
	appengine/static/src/javascript/sactraffic.js

CSS = appengine/static/src/stylesheets/main.css \
	appengine/static/src/stylesheets/awesome.css


all: ${FILES}

appengine/static/javascript/sactraffic.min.js: ${JS}
	${CLOSURE} --js_output_file $@ --js $^

appengine/static/stylesheets/sactraffic.min.css: ${CSS}
	cat $^ | ${YUICOMP} -o $@ --type css

clean:
	rm -f ${FILES}
