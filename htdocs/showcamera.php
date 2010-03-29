<?php
	$name = "No camera specified";
	$url = "";
	$width = 600;
	$height = 440;	

	if (isset($_GET['id'])) {
		$xml = new SimpleXMLElement(file_get_contents("cameras.xml"));
		foreach ($xml->camera as $camera) {
			if ($camera['id'] == $_GET['id']) {
				$show_camera = $camera;
			}
		}
	}

	if (isset($show_camera)) {
		$name = $show_camera['name'];
		$url = $show_camera['url'];
		$width = $show_camera->size['width'];
		$height = $show_camera->size['height'];
	}
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
	"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<title>Live Traffic Camera: <?php echo $name?></title>
<meta name="description" content="Live video feed of Sacramento traffic conditions."/>
<meta name="keywords" content="accidents, news, CHP, California Highway Patrol, cars, driving, freeway, video, live"/>
<link rel="stylesheet" type="text/css" href="style.css" />
</head>

<body style="width:<?php echo $width + 60 ?>px">

<?php if ($width + 20 >= 468) { ?>
<div id="top_banner" class="ad banner">
	<script type="text/javascript"><!--
		google_ad_client = "pub-0887871162421804";
		/* Video Banner */
		google_ad_slot = "8509596722";
		google_ad_width = 468;
		google_ad_height = 60;
		//-->
	</script>
	<script type="text/javascript" src="http://pagead2.googlesyndication.com/pagead/show_ads.js"></script>
</div>
<?php } else { ?> 
<div id="top_banner" class="ad halfbanner">
	<script type="text/javascript"><!--
		google_ad_client = "pub-0887871162421804";
		/* Video Half Banner */
		google_ad_slot = "2965741516";
		google_ad_width = 234;
		google_ad_height = 60;
		//-->
	</script>
	<script type="text/javascript" src="http://pagead2.googlesyndication.com/pagead/show_ads.js"></script>
</div>
<?php } ?>

<div id="content">
	<h2>Live Camera at <?php echo $name?></h2>

	<div id="video_canvas" style="width:<?php echo $width?>px; height:<?php echo $height?>px">
		<object
			type="application/x-oleobject"
			codebase="http://activex.microsoft.com/activex/controls/mplayer/en/nsmp2inf.cab#Version=5,1,52,701"
			classid="CLSID:22d6f312-b0f6-11d0-94ab-0080c74c7e95"
			standby="Loading..."
			width="<?php echo $width?>"
			height="<?php echo $height?>">
	
			<param name="FileName" value="<?php echo $url?>"/>
			<param name="ShowControls" value="false"/>
	
			<embed
				type="application/x-mplayer2"
				src="<?php echo $url?>"
				width="<?php echo $width?>"
				height="<?php echo $height?>"
				showcontrols="0"
				autostart="true"
				pluginspage="http://www.microsoft.com/Windows/MediaPlayer/">
			</embed>
		</object>
	</div>

	<span style="color:#999;font-size:10px;text-align:center">Video may not start immediately on Mac OS systems</span>
</div> <!-- #content -->

<script type="text/javascript">
	var gaJsHost = (("https:" == document.location.protocol) ? "https://ssl." : "http://www.");
	document.write(unescape("%3Cscript src='" + gaJsHost + "google-analytics.com/ga.js' type='text/javascript'%3E%3C/script%3E"));
</script>
<script type="text/javascript">
	var pageTracker = _gat._getTracker("UA-4894819-1");
	pageTracker._trackPageview();
</script>

</body>
</html>
<!--
vim: ts=4
-->
