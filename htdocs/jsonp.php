<?php
	$safe_dispatch = (isset ($_GET['dispatch']) && preg_match ("/^[A-Z]{4}-[A-Z]{4}$/", $_GET['dispatch'])) ? $_GET['dispatch'] : "STCC-STCC";
	$dispatch_file = "json/" . $safe_dispatch . ".json";
	$callback = (isset($_GET['callback'])) ? $_GET['callback'] : "incident_callback";

	header('Content-type: application/json');

	if (isset ($_GET['dispatch']) && file_exists($dispatch_file)) {
		$base_url = "http://www.sactraffic.org/";
		$last_mod = date ("D, d M Y H:i:s T", filemtime($dispatch_file));
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

		header('Etag: '.$etag);
		header('Last-Modified: '.$last_mod);
	}

	echo "$callback (";
	if (file_exists($dispatch_file))
		readfile ($dispatch_file);
	echo ");";
?>
