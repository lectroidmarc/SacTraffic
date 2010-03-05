<?php
	require_once "XML/Util.php";

	header('Content-type: text/xml');

	print XML_Util::getXMLDeclaration();
	print '<?xml-stylesheet type="text/xsl" href="sitemap.xsl"?>';
	print XML_Util::createStartElement('urlset', array(
		"xmlns" => "http://www.sitemaps.org/schemas/sitemap/0.9",
		"xmlns:xsi" => "http://www.w3.org/2001/XMLSchema-instance",
		"xsi:schemaLocation" => "http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd")
	);
?>

	<url>
		<loc>http://www.sactraffic.org/</loc>
		<lastmod><?php echo date ("c", filemtime("index.html")) ?></lastmod>
		<changefreq>always</changefreq>
		<priority>0.8</priority>
	</url>
	<url>
		<loc>http://www.sactraffic.org/about.html</loc>
		<lastmod><?php echo date ("c", filemtime("about.html")) ?></lastmod>
		<changefreq>monthly</changefreq>
		<priority>0.5</priority>
	</url>

<?php
	$xml = new SimpleXMLElement(file_get_contents("cameras.xml"));

	foreach ($xml->camera as $camera) {
		print "\t".XML_Util::createStartElement('url')."\n";
		print "\t\t".XML_Util::createTag('loc', null, "http://www.sactraffic.org/showcamera.php?id=" . $camera['id'])."\n";
		print "\t\t".XML_Util::createTag('priority', null, '0.2')."\n";
		print "\t".XML_Util::createEndElement("url")."\n";
	}

	print XML_Util::createEndElement("urlset");
?>
