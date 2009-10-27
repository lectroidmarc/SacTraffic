<?php
	require_once "XML/Util.php";
	require_once "Zend/Json/Decoder.php";

	$base_url = "http://www.sactraffic.org/";
	$last_mod = date ("D, d M Y H:i:s T", filemtime("json/STCC-STCC.json"));
	$etag = sha1($last_mod);

	// Check conditional headers...
	$request_headers = apache_request_headers();
	if (
		isset($request_headers["If-None-Match"]) &&
		$request_headers["If-None-Match"] == $etag ||
		isset($request_headers["If-Modified-Since"]) &&
		$request_headers["If-Modified-Since"] == $last_mod) {

		header('HTTP/1.1 304 Not Modified');
		exit;
	}

	#$chp_info = json_decode(file_get_contents("json/STCC-STCC.json"));
	$chp_info = Zend_Json::decode(file_get_contents("json/STCC-STCC.json"), Zend_Json::TYPE_OBJECT);

	header('Content-type: application/rss+xml');
	header('Etag: '.$etag);
	header('Last-Modified: '.$last_mod);

	$title = "Sacramento Area Traffic Alerts";
	$freeway = (isset($_GET['f'])) ? $_GET['f'] : "";
	switch ($freeway) {
		case "I5":
			$title .= " along I5";
			break;
		case "I80":
			$title .= " along I80";
			break;
		case "US50":
			$title .= " along Hwy 50";
			break;
		case "SR99":
			$title .= " along Hwy 99";
			break;
		case "":
			break;
		default:
			$title .= " customized listing";
	}

	print XML_Util::getXMLDeclaration();
	print XML_Util::createStartElement('rss', array("version" => "2.0", "xmlns:atom" => "http://www.w3.org/2005/Atom", "xmlns:georss" => "http://www.georss.org/georss"));
	print XML_Util::createStartElement('channel');
	print XML_Util::createTag('title', null, $title);
?>

	<link>http://www.sactraffic.org/</link>
	<description>Sacramento area traffic alerts as reported by the Califoria Highway Patrol</description>
	<ttl>5</ttl>
	<atom:link href="http://www.sactraffic.org/rss.php" rel="self" type="application/rss+xml" />

	<image>
		<url>http://www.sactraffic.org/images/sactraffic.png</url>
		<title>Sacramento Area Traffic Alerts</title>
		<link>http://www.sactraffic.org/</link>
		<height>105</height>
		<width>105</width>
	</image>

<?php
	// Support comma notation
	if (isset ($_GET['f'])) {
		$regexp_str = preg_replace('/,\s*/', '|', preg_quote($_GET['f']));
	}

	for ($x = 0; $x < count($chp_info); $x++) {
		$incident = $chp_info[$x];

		if (isset ($_GET['f']) && !preg_match("/".$regexp_str."/i", $incident->Location))
			continue;

		print XML_Util::createStartElement('item');
		print XML_Util::createTag('title', null, $incident->LogType);
		print XML_Util::createTag('link', null, $base_url."incident.html?id=".$incident->ID);

		if (isset ($incident->TBXY)) {
			$description = "<a href=\"http://maps.google.com/maps?q=".tbxy2georss($incident->TBXY)."\">".$incident->Location."</a>, ".$incident->Area;
		} else {
			$description = $incident->Location.", ".$incident->Area;
		}

		if (isset ($incident->LogDetails->details)) {
			$description .= "<ul>";
			for ($y = 0; $y < count($incident->LogDetails->details); $y++) {
				$detailtime = preg_replace('/^"|"$/', '', $incident->LogDetails->details[$y]->DetailTime);
				$incidentdetail = preg_replace('/^"|"$/', '', $incident->LogDetails->details[$y]->IncidentDetail);

				$description .= "<li>".$detailtime.": ".$incidentdetail."</li>";
			}
			$description .= "</ul>";
		}

		print XML_Util::createTag('description', null, $description);
		print XML_Util::createTag('pubDate', null, date("r", $incident->LogTimeEpoch));
		print XML_Util::createTag('guid', array("isPermaLink" => "false"), $incident->ID);
		print XML_Util::createTag('source', array("url" => "http://media.chp.ca.gov/sa_xml/sa.xml"), "CHP");
		print XML_Util::createTag('category', null, $incident->LogTypeId);

		if (isset ($incident->TBXY))
			print XML_Util::createTag('georss:point', null, tbxy2georss($incident->TBXY));
		else if (isset ($incident->GeoCode))
			print XML_Util::createTag('georss:point', null, $incident->GeoCode);

		print XML_Util::createEndElement("item");
	}

	print XML_Util::createEndElement("channel");
	print XML_Util::createEndElement("rss");

	function tbxy2georss ($tbxy) {
		if (isset($tbxy) && $tbxy != "") {
			list($tbx, $tby) = split(':', $tbxy);

			$lat = $tby * 0.00000274 +  33.172;
			$lng = $tbx * 0.0000035  - 144.966;

			return $lat.",".$lng;
		} else {
			return "";
		}
	}
?>
