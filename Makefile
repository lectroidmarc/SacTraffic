.SUFFIXES: .js .min.js

JSMIN = jsmin

all: htdocs/sactraffic.min.js htdocs/sactraffic-single.min.js htdocs/sitenews.min.js

.js.min.js:
	${JSMIN} < $< > $@


