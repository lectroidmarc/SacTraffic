<?php
	require_once "Zend/Json/Decoder.php";

	$title = "";
	$headline = "Expired or Missing Incident";
	$chp_info = Zend_Json::decode(file_get_contents("json/STCC-STCC.json"), Zend_Json::TYPE_OBJECT);

	if (isset ($_GET['id'])) {
		if (preg_match('/^\d{4}\w\d{4}$/', $_GET['id'])) {
			$title = " #" . $_GET['id'];
			$headline .= " (#" . $_GET['id'] . ")";
		}

		for ($x = 0; $x < count($chp_info); $x++) {
			$incident = $chp_info[$x];

			if ($incident->ID == $_GET['id']) {
				$title = ": ".$incident->LogType;
				$headline = $incident->LogType;
				if ($incident->Status == "inactive") {
					$headline .= " (no longer active)";
				}

				break;
			}
		}
	}
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
	"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<title>Sacramento Area Traffic Alert<?php echo $title; ?></title>
<meta name="description" content="Sacramento area traffic alerts from the California Highway Patrol."/>
<meta name="keywords" content="accidents, news, CHP, California Highway Patrol, cars, driving, freeway"/>
<link rel="shortcut icon" href="/images/sactraffic.png" />

<link rel="stylesheet" type="text/css" href="/style.min.css" />

<link rel="alternate" type="application/rss+xml" title="Sac Traffic RSS Feed" href="/rss.php" />

<meta name="viewport" content="width = 370" />
</head>

<body>
<div id="top_banner" class="ad leaderboard">
	<script type="text/javascript"><!--
		google_ad_client = "pub-0887871162421804";
		if (screen.width <= 480) {
			var banner = document.getElementById("top_banner");
			banner.className = 'ad halfbanner';

			/* Mobile Leaderboard */
			google_ad_slot = "1236279869";
			google_ad_width = 234;
			google_ad_height = 60;
		} else {
			/* Leaderboard */
			google_ad_slot = "3264684355";
			google_ad_width = 728;
			google_ad_height = 90;
		}
		//-->
	</script>
	<script type="text/javascript" src="http://pagead2.googlesyndication.com/pagead/show_ads.js"></script>
</div>

<div id="content">
	<div id="header">
		<h1><?php echo $headline; ?></h1>
	</div>

	<div id="leftcol">
		<ul id="incidents_above" class="incidents"><li class="loading">Loading...<br/><img src="/images/loading.gif" alt="loading"/></li></ul>

		<div id="inline_ad" class="ad halfbanner">
			<script type="text/javascript"><!--
				google_ad_client = "pub-0887871162421804";
				/* Half Banner */
				google_ad_slot = "9377068793";
				google_ad_width = 234;
				google_ad_height = 60;
				//-->
			</script>
			<script type="text/javascript" src="http://pagead2.googlesyndication.com/pagead/show_ads.js"></script>
		</div>

		<ul id="incidents_below" class="incidents"><li style="display:none"><!-- this space for rent --></li></ul>
	</div>

	<div id="rightcol">
		<div id="map"></div>

		<form id="mapopts" action="">
			<input type="checkbox" class="traffic" /><span class="traffic">Show traffic conditions</span>
			<input type="checkbox" class="live_cams" /><span class="live_cams">Show live cameras</span>
		</form>
	</div>

	<div id="footer">
		<span><a href="/about.html">About this site</a></span>
	</div>
</div> <!-- #content -->

<script type="text/javascript" src="http://www.google.com/jsapi?key=ABQIAAAAlAZP1OSueWm4o6pWOnsJahT8awnw3lCjmpiGr3BOlHAKhFGNCRS5zrKL_yiOOy6TBcqg5U2TjCHYTQ"></script>
<script type="text/javascript">
	google.load("jquery", "1");
	google.load("maps", "2");
</script>
<script type="text/javascript" src="/javascript/sactraffic.min.js"></script>
<script type="text/javascript">
	init_incident("<?php echo $_GET['id']; ?>");
</script>

<script type="text/javascript">
	var gaJsHost = (("https:" == document.location.protocol) ? "https://ssl." : "http://www.");
	document.write(unescape("%3Cscript src='" + gaJsHost + "google-analytics.com/ga.js' type='text/javascript'%3E%3C/script%3E"));
</script>
<script type="text/javascript">
	var pageTracker = _gat._getTracker("UA-4894819-1");
	pageTracker._trackPageview();
</script>

<script type="text/javascript" src="http://media.sacbee.com/static/sacconnect/sacconnect-min.js"></script>
</body>
</html>
<!--
vim: ts=4
-->