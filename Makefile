#
# Generic Makefile for minified (and possibly aggregated) JavaScript
#

.SUFFIXES: .js .min.js .css .min.css

JSMIN = jsmin

JS = htdocs/sactraffic.min.js \
	htdocs/sactraffic-single.min.js \
	htdocs/sitenews.min.js

CSS = htdocs/style.min.css \
	htdocs/iphone.min.css


all: ${JS} ${CSS}


#aggegated.js: ${JS}
#	cat $^ > $@
#
#aggegated.css: ${CSS}
#	cat $^ > $@


.js.min.js:
	${JSMIN} < $< > $@

.css.min.css:
	${JSMIN} < $< > $@