#
# Generic Makefile for minified (and possibly aggregated) JavaScript
#

.SUFFIXES: .js .min.js .css .min.css
.PHONY: clean

YUICOMP = java -jar support/yuicompressor-2.4.7.jar
CLOSURE = java -jar support/closure-compiler.jar

FILES = appengine/static/javascript/sactraffic.min.js \
	appengine/static/stylesheets/sactraffic.min.css \
	appengine/static/javascript/sactraffic-widget.min.js \
	appengine/static/stylesheets/widget-blue.min.css \
	appengine/static/stylesheets/widget-lectroid.min.css

JS = appengine/static/javascript/date.js \
	appengine/static/javascript/incident.js \
	appengine/static/javascript/incidentlist.js \
	appengine/static/javascript/requestargs.js \
	appengine/static/javascript/trafficmap.js \
	appengine/static/javascript/trafficnews.js \
	appengine/static/javascript/sactraffic.js

WIDGET_JS = appengine/static/javascript/date.js \
	appengine/static/javascript/string.js \
	appengine/static/javascript/sactraffic-widget.js

CSS = appengine/static/stylesheets/main.css \
	appengine/static/stylesheets/awesome.css

all: ${FILES}


appengine/static/javascript/sactraffic.min.js: ${JS}
	${CLOSURE} --js_output_file $@ --js $^

appengine/static/javascript/sactraffic-widget.min.js: ${WIDGET_JS}
	${CLOSURE} --js_output_file $@ --js $^

appengine/static/stylesheets/sactraffic.min.css: ${CSS}
	cat $^ | ${YUICOMP} -o $@ --type css

.js.min.js:
	${CLOSURE} --js_output_file $@ --js $<

.css.min.css:
	${YUICOMP} -o $@ $<


clean:
	rm -f ${FILES}
