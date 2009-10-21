/**
 * @fileoverview Code to support dynamic headlines on sactraffic.org
 * @requires Google Feed API
 * @requires jQuery
 */

/**
 * Display current headlines.
 */
function get_heads (element, url, days_old) {
	var feed = new google.feeds.Feed(url);
	feed.load(function (result) {
		if (!result.error) {
			var show_sitenews = false;
			jQuery(element).empty();

			jQuery.each(result.feed.entries, function(i, entry) {
				if (days_old) {
					var now = new Date();
					var week_ago = new Date(now.getTime() - 86400 * days_old * 1000);
					var post_date = new Date(entry.publishedDate);
					if (post_date < week_ago) return false;
				}

				show_sitenews = true;

				jQuery(element).append(
					jQuery('<li/>').append(
						jQuery('<a/>').attr('href', entry.link).html(entry.title)
					).append(
						'<br/>'
					).append(
						jQuery('<span/>').html(entry.contentSnippet)
					)
				);
			});

			if (show_sitenews) jQuery('#sitenews').show("slow");
		}
	});
}