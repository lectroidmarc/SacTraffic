""" A set of helper functions for the GAE bulkloader tool. """

import datetime

def now(none):
	""" Simply returns "now" (in UTC). """
	return datetime.datetime.utcnow()
