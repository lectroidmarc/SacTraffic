#
# Generic Makefile for minified (and possibly aggregated) JavaScript
#

.SUFFIXES: .js .min.js .css .min.css

YUICOMP = java -jar support/yuicompressor-2.4.2.jar
CLOSURE = support/closure.py

FILES = appengine/static/javascript/sactraffic.min.js \
	appengine/static/stylesheets/sactraffic.min.css \
	appengine/static/javascript/sactraffic-widget.min.js \
	appengine/static/stylesheets/widget.min.css

JS = appengine/static/javascript/sactraffic-base.js \
	appengine/static/javascript/sactraffic-list.js \
	appengine/static/javascript/sactraffic-map.js \
	appengine/static/javascript/sactraffic-news.js

CSS = appengine/static/stylesheets/main.css \
	appengine/static/stylesheets/awesome.css

all: ${FILES}


appengine/static/javascript/sactraffic.min.js: ${JS}
	${CLOSURE} -o $@ $^

appengine/static/stylesheets/sactraffic.min.css: ${CSS}
	cat $^ | ${YUICOMP} -o $@ --type css && perl -pi -e "s/screen and\(max/screen and \(max/" $@

.js.min.js:
	${CLOSURE} -o $@ $<

.css.min.css:
	${YUICOMP} -o $@ $< && perl -pi -e "s/screen and\(max/screen and \(max/" $@


clean:
	rm -f ${FILES}
