<?php
	header('Content-type: text/xml');

	$writer = new XMLWriter();
	$writer->openMemory();
	$writer->setIndent(true);

	$writer->startDocument();
	$writer->writePI('xml-stylesheet', 'type="text/xsl" href="sitemap.xsl"');

	$writer->startElement('urlset');
	$writer->writeAttribute('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');
	$writer->writeAttribute('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance');
	$writer->writeAttribute('xsi:schemaLocation', 'http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd');

	$writer->startElement('url');
	$writer->writeElement('loc', 'http://www.sactraffic.org/');
	$writer->writeElement('lastmod', date("c", filemtime("index.html")));
	$writer->writeElement('changefreq', 'always');
	$writer->writeElement('priority', '0.8');
	$writer->endElement();	//url

	$writer->startElement('url');
	$writer->writeElement('loc', 'http://www.sactraffic.org/about.html');
	$writer->writeElement('lastmod', date("c", filemtime("about.html")));
	$writer->writeElement('changefreq', 'monthly');
	$writer->writeElement('priority', '0.5');
	$writer->endElement();	//url

	$xml = new SimpleXMLElement(file_get_contents("cameras.xml"));
	foreach ($xml->camera as $camera) {
		$writer->startElement('url');
		$writer->writeElement('loc', 'http://www.sactraffic.org/showcamera.php?id=' . $camera['id']);
		$writer->writeElement('priority', '0.2');
		$writer->endElement();	//url
	}

	$writer->endElement();	//urlset

	echo $writer->outputMemory();
?>
