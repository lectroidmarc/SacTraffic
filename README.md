Code for [sacraffic.org][sactraffic]
=====

##What is SacTraffic.org

SacTraffic.org is a site I put together to show area traffic incidents powered primarily from an XML feed of state-wide traffic incidents from the California Highway Patrol.

Mix in some live video feeds and Twitter updates and you have [sactraffic.org][sactraffic].

##What you need to set this stuff up.

SacTraffic.org runs on [Google App Engine](http://code.google.com/appengine/) and is written in Python so at a minimum you'll need the App Engine SDK to run your own traffic site based on SacTraffic.

### A note about JavaScript compression

JavaScript compression is done via a simple wrapper script that uses the [Google Closure](http://code.google.com/closure/) web service.  This script is located in the `/support` directory.

Running `make` at the root level of the project will build the compressed files.

### Legacy LAMP version

The older Apache/Perl version of the SacTraffic.org code is available in the `lecacy-lamp-version` branch.

[sactraffic]: http://www.sactraffic.org "SacTraffic.org"
