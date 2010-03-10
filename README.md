Code for [SacTraffic.org](http://www.sactraffic.org)
=====

What is sactraffic.org
-----

Sactraffic.org is a site I put together to show area traffic incidents powered primarily from an XML feed of state-wide traffic incidents from the California Highway Patrol.

Mix in some Twitter updates and you have sactraffic.org.

What you need to set this stuff up.
-----

`perl` is the primary language used. The following Perl modules are needed as well.

* `Compress::Zlib` (optional, for creating pre-gziped versions of the JSON files).
* `DateTime::Format::Strptime`
* `JSON::Any`
* `LWP::UserAgent`
* `Net::Twitter::Lite` (optional, for Twittering)
* `XML::Simple`

`php` is also used in the web space for some of the dynamic pages.  `Zend_Json::decode` is used for decoding the JSON files because my provider doesn't have php 5.2 yet.

JavaScript and CSS compression
-----

JavaScript compression is done via a wrapper script that uses the [Google Closure](http://code.google.com/closure/) web service.  CSS compression is done via [YUI Compressor](http://developer.yahoo.com/yui/compressor/).  Both of these scripts are in the `/support` directory.

Running `make` at the root level of the project will build the compressed files.
