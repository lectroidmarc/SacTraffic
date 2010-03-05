#
# Generic Makefile for minified (and possibly aggregated) JavaScript
#

.SUFFIXES: .js .min.js .css .min.css

YUICOMP = java -jar support/yuicompressor-2.4.2.jar
CLOSURE = perl support/closure.pl

FILES = htdocs/javascript/sactraffic.min.js htdocs/style.min.css

JS = htdocs/javascript/sactraffic-base.js \
	htdocs/javascript/sactraffic-list.js \
	htdocs/javascript/sactraffic-map.js \
	htdocs/javascript/sactraffic-news.js

all: ${FILES}


htdocs/javascript/sactraffic.min.js: ${JS}
	${CLOSURE} -o $@ $^


.js.min.js:
	${YUICOMP} -o $@ $<

.css.min.css:
	${YUICOMP} -o $@ $< && perl -pi -e "s/screen and\(max/screen and \(max/" $@


checkcfg:
	xmllint --noout --valid process_chp-config.xml

clean:
	rm -f ${FILES}
