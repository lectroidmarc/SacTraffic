About sacraffic.org
----

### What is it

This site is just a little experiment in "web 2.0" mashups.  Starting with an XML feed of state-wide traffic incidents from the [California Highway Patrol](http://www.chp.ca.gov/) (available at http://media.chp.ca.gov/sa_xml/sa.xml) we pull out local incidents and build on them. Hopfully the result is something people find useful.

### So what's here?

First we display local incidents and their details, mapping them with the [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/).  Then we add Google's traffic conditions so you can see at-a-glance what area traffic os like.  Then we add live video from [Cal Trans](http://video.dot.ca.gov/) so you can actually *see* the traffic if that's what you want.

Finally, using the ATOM feed, there's a twitter feed at [@sactraffic](https://twitter.com/sactraffic) that's fed via [dlvr.it](http://dlvr.it/).

### Can I build on your work?

Yes... and no*. There are both [JSON](http://json.org/) and [ATOM](http://tools.ietf.org/html/rfc4287) feeds available at http://www.sactraffic.org/json and http://www.sactraffic.org/atom respectively, that cover the entire state.  They can be queried by the following HTTP GET args:

* `center` - The CHP Communication Center.  This is the broadest level.
* `dispatch` - The CHP Dispatch Center.  This is probably what you want.
* `area` - The CHP Office. The breaks the Dispatch Centers down further into offices.
* `city` - If there is a valid location we'll reverse geocode it for something a little more granular than the CHP office.
* `roads` - [ATOM only]. Filters the results by a comma separated list of street names.

So, for example, "SAHB" is the Sacramento Center code so http://www.sactraffic.org/json?center=SAHB will get you all the Sacramento Valley incidents (covering Sacramento, Chico and Stockton dispatches), and http:/www.sactraffic.org/json?dispatch=STCC will get you just the Sacramento Dispatch incidents (this is what this site uses).

You can go further, to the area offices so the North Sacramento office incidents would be http:/www.sactraffic.org/json?area=North%20Sacramento and going even further you can specify a city, like Folsom, which will get you http:/www.sactraffic.org/json?city=Folsom for the incidents actually in Folsom.

Also, if this is your thing, our ATOM feeds use [PuSH](https://code.google.com/p/pubsubhubbub/) notifications for near instant updates.

_Note: Only one of `center`, `dispatch`, `area` or `city` can be used at a time._ That's ok though, there's no sense in combining them as they're hierarchal.

### JSON Format

    [
      {
        "Area": "North Sacramento",
        "ID": "STCC.STCC.0347D1118",
        "Location": "SAN MARQUE CIR at WALNUT AV",
        "LocationDesc": "SAN MARQUE CIR at WALNUT AV",
        "LogDetails":
          {
            "details":
              [
                {
                  "DetailTime": " 8:11AM",
                  "IncidentDetail": "VEH VS FENCE \/ AND TRASH CANS AND LAWN"
                }
              ],
            "units":
              [
                {
                  "DetailTime": " 8:13AM",
                  "IncidentDetail": "CHP Unit Enroute"
                }
              ]
          },
        "LogTime": 1290096688,
        "LogType": "Hit & Run - No Injuries",
        "geolocation":
          {
            "lat": 38.6003784,
            "lon": -121.346033
          }
      }
    ]

Usage
----
The site runs on [Google App Engine](http://code.google.com/appengine/) and since I do this for fun, I have set a pretty low pricing cap.  So, please, feel free to use the ATOM and/or JSON feeds as you see fit, just know that if you do and you start seeing __503 Over Quota__ errors, well, you might want to think about paying my hosting bills.

What you need to set this stuff up.
----

SacTraffic.org runs on [Google App Engine](http://code.google.com/appengine/) and is written in Python so at a minimum you'll need the [App Engine SDK](https://developers.google.com/appengine/downloads#Google_App_Engine_SDK_for_Python) to run your own traffic site based on SacTraffic.

### A note about JavaScript compression

JavaScript compression is done via [Google Closure](http://code.google.com/closure/).  Running `make` at the root level of the project will build the compressed files.

### Legacy LAMP version

The older Apache/Perl version of the SacTraffic.org code is available at the `lecacy-lamp-version` tag.

[sactraffic]: http://www.sactraffic.org "SacTraffic.org"
