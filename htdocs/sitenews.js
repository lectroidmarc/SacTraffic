/*
 * $Id: sitenews.js,v 1.3 2008/11/08 16:50:41 marcm Exp $
 */

function get_heads (element, url, days_old) {
	var feed = new google.feeds.Feed(url);
	feed.load(function (result) {
		if (!result.error) {
			var show_sitenews = false;
			$(element).empty();

			$.each(result.feed.entries, function(i, entry) {
				if (days_old) {
					var now = new Date();
					var week_ago = new Date(now.getTime() - 86400 * days_old * 1000);
					var post_date = new Date(entry.publishedDate);
					if (post_date < week_ago) return false;
				}

				show_sitenews = true;

				$(element).append(
					$('<li/>').append(
						$('<a/>').attr('href', entry.link).html(entry.title)
					).append(
						'<br/>'
					).append(
						$('<span/>').html(entry.contentSnippet)
					)
				);
			});

			if (show_sitenews) $('#sitenews').show("slow");
		}
	});
}