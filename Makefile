#
# Generic Makefile for minified (and possibly aggregated) JavaScript
#

.SUFFIXES: .js .min.js .css .min.css

.DUMMY: jsdoc checkcfg

YUICOMP = java -jar ${HOME}/Java/yuicompressor-2.4.2/build/yuicompressor-2.4.2.jar
CLOSURE = ./closure.pl

JSDOC_DIR = ${HOME}/Java/jsdoc-toolkit

JS = htdocs/javascript/sactraffic-base.js \
	htdocs/javascript/sactraffic-list.js \
	htdocs/javascript/sactraffic-map.js \
	htdocs/javascript/sactraffic-news.js

JS_MIN = htdocs/javascript/sactraffic-base.min.js \
	htdocs/javascript/sactraffic-list.min.js \
	htdocs/javascript/sactraffic-map.min.js \
	htdocs/javascript/sactraffic-news.min.js


all: htdocs/javascript/sactraffic.min.js htdocs/style.min.css


htdocs/javascript/sactraffic.min.js: ${JS}
	${CLOSURE} -o $@ $^

#htdocs/javascript/sactraffic.min.js: ${JS_MIN}
#	cat $^ > $@


.js.min.js:
	${YUICOMP} -o $@ $<

.css.min.css:
	${YUICOMP} -o $@ $< && perl -pi -e "s/screen and\(max/screen and \(max/" $@

jsdoc:
	java -jar ${JSDOC_DIR}/jsrun.jar ${JSDOC_DIR}/app/run.js -p -a \
		-E='.min.js' -t=${JSDOC_DIR}/templates/jsdoc -d=htdocs/devel/jsdocs \
		htdocs/javascript

checkcfg:
	xmllint --noout --valid process_chp-config.xml
