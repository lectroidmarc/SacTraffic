<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" 
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
	<xsl:template match="/">
		<html xmlns="http://www.w3.org/1999/xhtml">
			<head>
				<title>XML Sitemap</title>
				<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
				<link rel="stylesheet" href="/stylesheets/sactraffic.min.css" />
				<style type="text/css">
					table {
						width: 90%;
						margin: 10px auto;
						font-family: "Lucida Grande","Lucida Sans Unicode",Tahoma,Verdana;
					}
					th {
						border-bottom: 1px black solid;
					}
					td {
						font-size: 11px;
						padding: 5px;
					}
					th {
						text-align: left;
						padding-right: 30px;
						font-size: 11px;
					}
					tr.high {
						background-color: whitesmoke;
					}
				</style>
			</head>
			<body>
				<div id="content" style="margin-top: 20px">
					<div id="header">
						<h1>XML Sitemap</h1>
						<p class="info">This is a XML Sitemap which is supposed to be processed by search engines like <a href="http://www.google.com">Google</a>, <a href="http://search.msn.com">MSN Search</a> and <a href="http://www.yahoo.com">Yahoo</a>.</p>
						<p class="info">You can find more information about XML sitemaps on <a href="http://sitemaps.org">sitemaps.org</a> and Google's <a href="http://code.google.com/sm_thirdparty.html">list of sitemap programs</a>.</p>
					</div>

					<div>
						<table>
							<tr>
								<th>URL</th>
								<th>Priority</th>
								<th>Change Frequency</th>
								<th>LastChange</th>
							</tr>
							<xsl:variable name="lower" select="'abcdefghijklmnopqrstuvwxyz'"/>
							<xsl:variable name="upper" select="'ABCDEFGHIJKLMNOPQRSTUVWXYZ'"/>
							<xsl:for-each select="sitemap:urlset/sitemap:url">
								<tr>
									<xsl:if test="position() mod 2 != 1">
										<xsl:attribute  name="class">high</xsl:attribute>
									</xsl:if>
									<td>
										<xsl:variable name="itemURL">
											<xsl:value-of select="sitemap:loc"/>
										</xsl:variable>
										<a href="{$itemURL}">
											<xsl:value-of select="sitemap:loc"/>
										</a>
									</td>
									<td>
										<xsl:value-of select="concat(sitemap:priority*100,'%')"/>
									</td>
									<td>
										<xsl:value-of select="concat(translate(substring(sitemap:changefreq, 1, 1),concat($lower, $upper),concat($upper, $lower)),substring(sitemap:changefreq, 2))"/>
									</td>
									<td>
										<xsl:value-of select="concat(substring(sitemap:lastmod,0,11),concat(' ', substring(sitemap:lastmod,12,5)))"/>
									</td>
								</tr>
							</xsl:for-each>
						</table>
					</div>

					<div id="footer">
						<span style="float:right"><a href="about.html">About this site</a></span>
						sitemap.xml
					</div>
				</div>
			</body>
		</html>
	</xsl:template>
</xsl:stylesheet>