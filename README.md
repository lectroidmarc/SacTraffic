Code for [SacTraffic.org](http://www.sactraffic.org)
=====

What is sactraffic.org
-----

Sactraffic.org is a site I put together to show area traffic incidents powered primarily from an XML feed of state-wide traffic incidents from the California Highway Patrol.

Mix in some Twitter updates and you have sactraffic.org.

What you need to set this stuff up.
-----

`perl` is the primary language used. The following Perl modules are needed as well.

* `JSON::Any`
* `LWP::UserAgent`
* `Net::Twitter`

`php` is also used in the web space for some of the dynamic pages.

JavaScript and CSS compression
-----

JavaScript compression is done via a wrapper script that uses the Google Closure web service.  CSS compression is done via YUICompressor.  Both of these scripts are in the /support directory.
