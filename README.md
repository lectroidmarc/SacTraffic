Code for [sacraffic.org][sactraffic]
=====

##What is SacTraffic.org

SacTraffic.org is a site I put together for fun to show local (to me) traffic incidents powered primarily from an [XML feed](http://media.chp.ca.gov/sa_xml/sa.xml) of state-wide traffic incidents from the California Highway Patrol.

Mix in some live video feeds and Twitter updates and you have [sactraffic.org][sactraffic].

##What you need to set this stuff up.

SacTraffic.org runs on [Google App Engine](http://code.google.com/appengine/) and is written in Python so at a minimum you'll need the App Engine SDK to run your own traffic site based on SacTraffic.

### A note about JavaScript compression

JavaScript compression is done via [Google Closure](http://code.google.com/closure/).  Running `make` at the root level of the project will build the compressed files.

### Legacy LAMP version

The older Apache/Perl version of the SacTraffic.org code is available at the `lecacy-lamp-version` tag.

[sactraffic]: http://www.sactraffic.org "SacTraffic.org"
