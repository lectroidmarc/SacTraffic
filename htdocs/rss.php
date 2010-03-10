<?php
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

	$writer = new XMLWriter();
	$writer->openMemory();
	$writer->setIndent(true);

	$writer->startDocument();
	$writer->startElement('rss');
	$writer->writeAttribute('version', '2.0');
	$writer->writeAttribute('xmlns:atom', 'http://www.w3.org/2005/Atom');
	$writer->writeAttribute('xmlns:georss', 'http://www.georss.org/georss');

	$writer->startElement('channel');
	$writer->writeElement('title', $title);
	$writer->writeElement('link', 'http://www.sactraffic.org/');
	$writer->writeElement('description', 'Sacramento area traffic alerts as reported by the Califoria Highway Patrol');
	$writer->writeElement('ttl', '5');

	$writer->startElement('atom:link');
	$writer->writeAttribute("href", "http://www.sactraffic.org/rss.php");
	$writer->writeAttribute("rel", "self");
	$writer->writeAttribute("type", "application/rss+xml");
	$writer->endElement();	//atom:link

	$writer->startElement('image');
	$writer->writeElement('url', 'http://www.sactraffic.org/images/sactraffic.png');
	$writer->writeElement('title', 'Sacramento Area Traffic Alerts');
	$writer->writeElement('link', 'http://www.sactraffic.org/');
	$writer->writeElement('height', '105');
	$writer->writeElement('width', '105');
	$writer->endElement();	//image

	// Support comma notation
	if (isset ($_GET['f'])) {
		$regexp_str = preg_replace('/,\s*/', '|', preg_quote($_GET['f']));
	}

	for ($x = 0; $x < count($chp_info); $x++) {
		$incident = $chp_info[$x];

		if (isset ($_GET['f']) && !preg_match("/".$regexp_str."/i", $incident->Location))
			continue;

		$writer->startElement('item');
		$writer->writeElement('title', $incident->LogType);
		$writer->writeElement('link', $base_url."incident.html?id=".$incident->ID);

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

		$writer->writeElement('description', $description);
		$writer->writeElement('pubDate', date("r", $incident->LogTimeEpoch));

		$writer->startElement('guid');
		$writer->writeAttribute('isPermaLink', 'false');
		$writer->text($incident->ID);
		$writer->endElement();	//guid

		$writer->startElement('source');
		$writer->writeAttribute('url', 'http://media.chp.ca.gov/sa_xml/sa.xml');
		$writer->text('CHP');
		$writer->endElement();	//source

		$writer->writeElement('category', $incident->LogTypeId);

		if (isset($incident->TBXY) && !empty($incident->TBXY)) {
			$writer->writeElement('georss:point', tbxy2georss($incident->TBXY));
		}

		$writer->endElement();	//item
	}

	$writer->endElement();	//channel
	$writer->endElement();	//rss

	echo $writer->outputMemory();


	function tbxy2georss ($tbxy) {
		if (isset($tbxy) && $tbxy != "") {
			list($tbx, $tby) = split(':', $tbxy);

			$lat = $tby * 0.00000274 +  33.172;
			$lng = $tbx * 0.0000035  - 144.966;

			return $lat." ".$lng;
		} else {
			return "";
		}
	}
?>
