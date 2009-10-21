#
# Generic Makefile for minified (and possibly aggregated) JavaScript
#

.SUFFIXES: .js .min.js .css .min.css

JSMIN = jsmin

JS = htdocs/javascript/sactraffic-base.min.js \
	htdocs/javascript/sactraffic-list.min.js \
	htdocs/javascript/sactraffic-map.min.js \
	htdocs/javascript/sactraffic-news.min.js

CSS = htdocs/style.min.css \
	htdocs/iphone.min.css


all: ${JS} ${CSS} htdocs/javascript/sactraffic.min.js


htdocs/javascript/sactraffic.min.js: ${JS}
	cat $^ > $@

#htdocs/sactraffic.css: ${CSS}
#	cat $^ > $@


.js.min.js:
	${JSMIN} < $< > $@

.css.min.css:
	${JSMIN} < $< > $@
