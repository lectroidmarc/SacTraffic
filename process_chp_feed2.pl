#!/usr/bin/perl

# $Id: process_chp_feed2.pl,v 1.9 2008/11/08 17:44:26 marcm Exp $

use strict;
use warnings;
use lib '/home/mmatteo/perl_lib';

use DateTime::Format::Strptime;
use Getopt::Std;
use JSON::Any;
use IO::Compress::Gzip qw(gzip $GzipError);
use LWP::UserAgent;
use Storable;
use XML::Simple;

#use Data::Dumper;

# Setup stuff...
chdir "/home/mmatteo/www.sactraffic.org/";

my %opts;
#	-f: force, force an update of all files, assumes no twittering
#	-q: quiet, no printing
#	-t: no twittering
getopts('fqt', \%opts);

# better for debugging
$| = 1 unless $opts{'q'};

# Get the CHP feed... do this first.  If there's a 304 or 400 then we stop
my $chp_feed = get_chp_incidents();

my $config = XMLin("process_chp-config.xml", ForceArray => ['geocode', 'twitter']);
#print Dumper($config);
#exit;

# We might not have Twitter support, so test for it...
eval { require Net::Twitter; };
my $have_twitter = ($@) ? 0 : 1;

foreach my $center (keys %{$chp_feed->{'Center'}}) {
	foreach my $dispatch (keys %{$chp_feed->{'Center'}->{$center}->{'Dispatch'}}) {
		print "Processing '$center-$dispatch' incidents\n" unless $opts{'q'};

		my $j = JSON::Any->new();
		my @incident_list;
		my $old_json_data = "";
		my $geocode_data;
		my $last_logdate;

		my $incidents = $chp_feed->{'Center'}->{$center}->{'Dispatch'}->{$dispatch}->{'Log'};
		my $json_file = $config->{'jsonpath'}."/".$center."-".$dispatch.".json";

		# Read in the old JSON file, use it to check if there are new incidents
		unless ($opts{'f'} || !-e $json_file) {
			local $/;

			open (JSON, "<$json_file");
			$old_json_data = <JSON>;
			close (JSON);

			my $old_incidents = $j->jsonToObj($old_json_data);
			$geocode_data = index_geocode_data($old_incidents);
			$last_logdate = as_datetime($old_incidents->[0]->{'LogTime'}) if $old_incidents->[0]->{'LogTime'};
		}

		# Step through the incidents in this dispatch
		foreach my $incident_id (sort { DateTime->compare(as_datetime($incidents->{$a}->{'LogTime'}), as_datetime($incidents->{$b}->{'LogTime'})) } keys %$incidents) {
			my $incident = $incidents->{$incident_id};

			# Goddamn quotes
			# note: this does NOT get the LogDetails
			foreach (values %$incident) {
				s/^"\s*|\s*"$//g;
			}

			my $logdate = as_datetime($incident->{'LogTime'});
			my $is_new_incident = ($last_logdate && $last_logdate >= $logdate) ? 0 : 1;

			if ($is_new_incident) {
				print "  ".$incident->{'LogType'}.": ".$incident->{'Location'}.", ".$incident->{'Area'}."\n" unless $opts{'q'};
		
				# Geocode, if possible, using the unmunged incident info
				if ($config->{'dispatch'}->{$center."-".$dispatch}->{'geocode'}) {
					$geocode_data->{$incident_id} = geocode($incident->{'Location'}, $incident->{'Area'}, $config->{'dispatch'}->{$center."-".$dispatch}->{'geocode'});
				}
			}
			
			$incident->{'GeoCode'} = $geocode_data->{$incident_id} if $geocode_data->{$incident_id};

			# Make or munge the data
			$incident->{'ID'} = $incident_id;
			
			# Capture the LogType number
			$incident->{'LogTypeId'} = $1 if ($incident->{'LogType'} =~ s/^((?:\w|\/)+) - //);
		
			# Un-cop-shorthand the location
			$incident->{'Location'} =~ s/\bJNO\b/just north of/i;
			$incident->{'Location'} =~ s/\bJSO\b/just south of/i;
			$incident->{'Location'} =~ s/\bJEO\b/just east of/i;
			$incident->{'Location'} =~ s/\bJWO\b/just west of/i;
		
			$incident->{'Location'} =~ s/\bNB\b/north bound/i;
			$incident->{'Location'} =~ s/\bSB\b/south bound/i;
			$incident->{'Location'} =~ s/\bEB\b/east bound/i;
			$incident->{'Location'} =~ s/\bWB\b/west bound/i;
		
			$incident->{'Location'} =~ s/\bOFR\b/offramp/i;
			$incident->{'Location'} =~ s/\bONR\b/onramp/i;
			$incident->{'Location'} =~ s/\bCON\b/connector/i;
		
			$incident->{'Location'} =~ s/\bAT\b/at/;
			$incident->{'Location'} =~ s/\bON\b/on/;
			$incident->{'Location'} =~ s/\bTO\b/to/;
		
			$incident->{'Location'} =~ s/\bSR51\b/CAP CITY FWY/;
		
			$incident->{'Location'} = ucfirst($incident->{'Location'});
		
			# RFC-822 (needed for RSS)
			$incident->{'LogTimeRFC822'} = $logdate->strftime("%a, %d %b %Y %T %z");
			# DEPRECATED ISO8601 (needed for microformats)
			$incident->{'LogTimeISO8601'} = $logdate->strftime("%FT%T%z");
			# Epoch (needed for javascript)
			$incident->{'LogTimeEpoch'} = $logdate->strftime("%s");

			# Look for sigalerts...
			$incident->{'sigalert'} = 0;
			foreach my $details (@{$incident->{'LogDetails'}->{'details'}}) {
				# Hey, get the quotes while we're here...
				$details->{'DetailTime'} =~ s/^"\s*|\s*"$//g;
				$details->{'IncidentDetail'} =~ s/^"\s*\^*|\s*"$//g;
		
				# Pad out those asterics used in alerts
				$details->{'IncidentDetail'} =~ s/(\w+)\*\*/$1 **/g;
				$details->{'IncidentDetail'} =~ s/\*\*(\w+)/** $1/g;
		
				$incident->{'sigalert'} = 1 if ($details->{'IncidentDetail'} =~ /SIG\s*ALERT/);
			}

			# More stuff if this is a new incident...
			if ($is_new_incident) {
				print "  Final: ".$incident->{'LogType'}.": ".$incident->{'Location'}."\n" unless $opts{'q'};

				foreach my $twitter_info (@{$config->{'dispatch'}->{$center."-".$dispatch}->{'twitter'}}) {
					twitter($incident, $twitter_info) unless (!$have_twitter || $opts{'t'} || $opts{'f'});
				}
			}

			# Save it
			push (@incident_list, $incident);
		}
		
		# Reverse incident list so the JSON data is in the right order
		my @reversed_list = reverse (@incident_list);
		my $new_json_data = $j->objToJson(\@reversed_list);

		# Only udpate the JSON file if we have changes
		if ($new_json_data ne $old_json_data && @incident_list > 0) {
			print "Updating '$center-$dispatch' JSON file... " unless $opts{'q'};

			open (JSON, ">$json_file") || die $!;
			print JSON $new_json_data;
			close (JSON);

			if (length($new_json_data) >= 500) {
				print "gzipping... " unless $opts{'q'};
				unless (gzip $json_file => $json_file.".gz", -Level => 9) {
					print "gzip failed: $GzipError " unless $opts{'q'};
				}
			} else {
				# Not expressly needed as mod_perl checks
				# timestamps on static gz files
				unlink $json_file.".gz" if -f $json_file.".gz";
			}

			print "done.\n" unless $opts{'q'};
		}
	}
}

# -30-


sub get_chp_incidents {
	print "Fetching CHP feed... " unless $opts{'q'};

	my $headers_stor = "temp/fetch_headers.stor";
	my $headers = retrieve($headers_stor) if (-e $headers_stor && !$opts{'f'});

	my $ua = LWP::UserAgent->new();
	my $response = $ua->get("http://media.chp.ca.gov/sa_xml/sa.xml", %$headers);

	if ($response->code eq "304") {
		print $response->status_line.", exiting.\n" unless $opts{'q'};
		exit;
	}

	die $response->status_line."\n" unless $response->is_success;

	print "done.\n" unless $opts{'q'};

	# Save headers for conditional GET next time
	$headers->{'If_None_Match'} = $response->header('ETag');
	$headers->{'If_Last_Modified'} = $response->header('Last-Modified');
	store $headers, $headers_stor;

	print "Parsing CHP feed... " unless $opts{'q'};

	$XML::Simple::PREFERRED_PARSER = "XML::Parser";
	my $xml = XMLin($response->content,
		KeyAttr => [ 'ID' ],
		NormaliseSpace => 2,
		ForceArray => [ 'Center', 'Dispatch', 'Log', 'details', 'units' ],
	);

	print "done.\n\n" unless $opts{'q'};

	return $xml;
}


sub index_geocode_data {
	my $array_ref = shift;
	my $data = {};

	foreach my $item (@{$array_ref}) {
		$data->{$item->{'ID'}} = $item->{'GeoCode'} if $item->{'GeoCode'};
	}

	return $data;
}


sub geocode {
	my $location = shift;
	my $area = shift;
	my $geocoder_data = shift;

	return undef if ($location eq "TMC");
	return undef if ($location eq "Freeway Service");

	$area =~ s/.* (Sacramento)/$1/;

	$location =~ s/\bJ(?:N|S|E|W)O\b/at/i;			# JWO etc.
	$location =~ s/\b(?:N|S|E|W)B\b//gi;			# NB, WB etc.
	$location =~ s/\b(?:OFR|ONR|CON)\b//gi;			# OFR, ONR and CON
	$location =~ s/\b(?:AT|ON|TO)\b/and/gi;			# AT, ON, TO to 'and'

	$location =~ s/\s+/ /g;							# whitespace
	$location =~ s/^\s+|\s+$//g;

	if ($geocoder_data->{'google'} && $geocoder_data->{'yahoo'}) {
		# HA, use both!
		# Google sucks for freeways
		if ($location =~ /(?:I|US|SR|CR)\d+/) {
			return y_geocode($location, $area, $geocoder_data->{'yahoo'}->{'apikey'});
		} else {
			return g_geocode($location, $area, $geocoder_data->{'google'}->{'apikey'});
		}
	} elsif ($geocoder_data->{'google'}) {
		return g_geocode($location, $area, $geocoder_data->{'google'}->{'apikey'});
	} elsif ($geocoder_data->{'yahoo'}) {
		return y_geocode($location, $area, $geocoder_data->{'yahoo'}->{'apikey'});
	} else {
		return undef;
	}
}


sub g_geocode {
	my $location = shift;
	my $area = shift;
	my $google_api_key = shift;

	# http://maps.google.com/maps/geo?q=XXX&output=csv&key=ABQIAAAAlAZP1OSueWm4o6pWOnsJahTWfCw_DNErtpfmuWl6JQkzmGW7WBT9Yucup9PJ4DO-lhEdGj3-tXkTwQ

	# http://code.google.com/apis/maps/faq.html#geocoder_highways
	$location =~ s/\b(I|US)(\d+)\b/$1-$2/g;
	$location =~ s/\b(?:SR|CR)(\d+)\b/CA-$1/g;

	print "    Google Geocoding: \'".$location.", ".$area.", CA\'... " unless $opts{'q'};

	my $ua = LWP::UserAgent->new();
	my $response = $ua->get("http://maps.google.com/maps/geo?output=csv&q=".$location.", ".$area.", CA&key=".$google_api_key);

	if ($response->is_success) {
		my @google_info = split(/,/, $response->content);
		if ($google_info[1] > 5) {
			print "ok.\n" unless $opts{'q'};
			return $google_info[2].", ".$google_info[3];
		} else {
			print "failed.\n" unless $opts{'q'};
		}
	} else {
		print $response->status_line unless $opts{'q'};
	}

	return undef;
}


sub y_geocode {
	my $location = shift;
	my $area = shift;
	my $yahoo_app_id = shift;

	# http://local.yahooapis.com/MapsService/V1/geocode?location=XXX&appid=.7eSeNXV34FtD2sVFkwjUCKHS_PCGPyud.paQ5Az7xX3zBUFC6DoVsu5E3.1hPowluSe

	print "    Yahoo Geocoding: \'".$location.", ".$area.", CA\'... " unless $opts{'q'};

	my $ua = LWP::UserAgent->new();
	my $response = $ua->get("http://local.yahooapis.com/MapsService/V1/geocode?location=".$location.", ".$area.", CA&appid=".$yahoo_app_id);

	if ($response->is_success) {
		my $yahoo_result = XMLin($response->content, ForceArray => ['Result']);
		my $result = $yahoo_result->{'Result'}[0];

		if ($result->{'precision'} eq "address" || $result->{'precision'} eq "street") {
			print "ok.\n" unless $opts{'q'};
			return $result->{'Latitude'}.", ".$result->{'Longitude'};
		} else {
			print "failed (".$result->{'precision'}.").\n" unless $opts{'q'};
		}
	} else {
		print $response->status_line."\n" unless $opts{'q'};
	}

	return undef;
}


sub twitter {
	my $incident = shift;
	my $twitter_data = shift;

	my $twitter = Net::Twitter->new(username => $twitter_data->{'login'}, password => $twitter_data->{'password'});

	print "    Twittering... " unless $opts{'q'};

	if ($incident->{'LogType'} eq "Media Information" ||
		$incident->{'LogType'} eq "Ped" ||
		$incident->{'LogType'} eq "Disabled Vehicle" ||
		$incident->{'LogType'} =~ /Traffic Hazard/) {
		print "skipped!\n" unless $opts{'q'};
	} else {
		my $link = "";

		if ($incident->{'GeoCode'} || $incident->{'TBXY'}) {
			$link = bitlyify("http://www.sactraffic.org/incident.html?id=".$incident->{'ID'});
		}

		my $result = $twitter->update($incident->{'LogType'}.": ".$incident->{'Location'}.", ".$incident->{'Area'}." ".$link);

		if ($result) {
			print "ok.\n" unless $opts{'q'};
		} else {
			print "failed.\n" unless $opts{'q'};
		}
	}
}


sub bitlyify {
	my $url = shift;

	my $ua = LWP::UserAgent->new(timeout => 5);
	my $response = $ua->get("http://bit.ly/api?url=" . $url);

	if ($response->is_success) {
		return $response->content 
	} else {
		return "";
	}
}

sub as_datetime {
	my $date_str = shift;

	$date_str =~ s/"//g;	# not expressly needed, but why not

	my $strp = new DateTime::Format::Strptime(
		pattern => '%m/%d/%Y %l:%M:%S %p',
		time_zone   => 'US/Pacific'
	);

	return $strp->parse_datetime($date_str);
}


# vim: ts=4
