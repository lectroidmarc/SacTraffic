#
# Generic Makefile for minified (and possibly aggregated) JavaScript
#

.SUFFIXES: .js .min.js .css .min.css

YUICOMP = java -jar support/yuicompressor-2.4.2.jar
CLOSURE = support/closure.py

FILES = appengine/static/javascript/sactraffic.min.js

JS = appengine/static/javascript/sactraffic-base.js \
	appengine/static/javascript/sactraffic-list.js \
	appengine/static/javascript/sactraffic-map.js \
	appengine/static/javascript/sactraffic-news.js

all: ${FILES}


appengine/static/javascript/sactraffic.min.js: ${JS}
	${CLOSURE} -o $@ $^


.js.min.js:
	${YUICOMP} -o $@ $<

.css.min.css:
	${YUICOMP} -o $@ $< && perl -pi -e "s/screen and\(max/screen and \(max/" $@


clean:
	rm -f ${FILES}
