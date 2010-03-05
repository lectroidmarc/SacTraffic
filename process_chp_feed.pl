#!/usr/bin/perl

#
# process_chp_feed.pl
#
# Script to pull in and process the CHP XML and build out JSON files.  Optionally tweeting the alerts.
#

use strict;
use warnings;
use lib '/home/mmatteo/perl_lib';

use DateTime::Format::Strptime;
use Getopt::Std;
use JSON::Any 1.17;	# Needs 1.17 for the true/false support
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

my $config = XMLin("process_chp-config.xml");

# We might not have Twitter support, so test for it...
eval { require Net::Twitter::Lite; };
my $have_twitter = ($@) ? 0 : 1;

foreach my $center (keys %{$chp_feed->{'Center'}}) {
	foreach my $dispatch (keys %{$chp_feed->{'Center'}->{$center}->{'Dispatch'}}) {
		next if ($dispatch eq "");	# Sometimes the dispatch comes up blank, it's rare, but avoid it.

		print "Processing '$center-$dispatch' incidents\n" unless $opts{'q'};

		my $j = JSON::Any->new();
		my @incident_list;
		my $old_json_data = "";
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
			}

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

			# Epoch (needed for javascript)
			$incident->{'LogTimeEpoch'} = $logdate->strftime("%s");

			# Detail cleanup...
			foreach my $details (@{$incident->{'LogDetails'}->{'details'}}) {
				# Hey, get the quotes while we're here...
				$details->{'DetailTime'} =~ s/^"\s*|\s*"$//g;
				$details->{'IncidentDetail'} =~ s/^"\s*\^*|\s*"$//g;

				# Pad out those asterics used in alerts
				$details->{'IncidentDetail'} =~ s/(\w+)\*\*/$1 **/g;
				$details->{'IncidentDetail'} =~ s/\*\*(\w+)/** $1/g;
			}

			# More stuff if this is a new incident...
			if ($is_new_incident) {
				print "  Final: ".$incident->{'LogType'}.": ".$incident->{'Location'}."\n" unless $opts{'q'};

				my $dispatch_config = $config->{'dispatch'}->{$center."-".$dispatch};
				my $twitter_info = $dispatch_config->{'twitter'};
				my $bitly_info = $dispatch_config->{'bitly'};

				# Check for Area-specific overrides
				if ($dispatch_config->{'area'}->{$incident->{'Area'}}) {
					$twitter_info = $dispatch_config->{'area'}->{$incident->{'Area'}}->{'twitter'};
					$bitly_info = $dispatch_config->{'area'}->{$incident->{'Area'}}->{'bitly'};
				}

				twitter($incident, $twitter_info, $bitly_info) if ($have_twitter && $twitter_info && !$opts{'t'} && !$opts{'f'});
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
					print "gzip failed: $GzipError... " unless $opts{'q'};
				}
			} else {
				# Not expressly needed as mod_gzip checks
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

sub twitter {
	my $incident = shift;
	my $twitter_data = shift;
	my $bitly_data = shift;

	print "    Twittering... " unless $opts{'q'};

	# Filter lame stuff to control the Twitter volume...
	if ($incident->{'LogType'} eq "Media Information" ||
		$incident->{'LogType'} eq "Ped" ||
		$incident->{'LogType'} eq "Disabled Vehicle" ||
		$incident->{'LogType'} eq "Animal in Roadway" ||
		$incident->{'LogType'} eq "Advise of Road or Weather conditions" ||
		$incident->{'LogType'} =~ /Traffic Hazard/) {
		print "skipped.\n" unless $opts{'q'};
	} else {
		my $link = "";
		my $geo = {};

		if ($incident->{'TBXY'} && $incident->{'TBXY'} ne "") {
			$link = bitlyify("http://www.sactraffic.org/incident.html?id=".$incident->{'ID'}, $bitly_data);
			$geo = tbxy2latlong($incident->{'TBXY'});
		}

		eval {
			my $twitter = Net::Twitter::Lite->new(
				consumer_key    => $config->{'twitter_app'}->{'consumer_key'},
				consumer_secret => $config->{'twitter_app'}->{'consumer_secret'},
			);
			$twitter->access_token($twitter_data->{'accesstoken'});
			$twitter->access_token_secret($twitter_data->{'accesstokensecret'});

			$twitter->update($incident->{'LogType'}.": ".$incident->{'Location'}.", ".$incident->{'Area'}." ".$link, $geo);
		};

		if ($@) {
			print "$@\n" unless $opts{'q'};
		} else {
			print "ok.\n" unless $opts{'q'};
		}
	}
}

sub bitlyify {
	my $url = shift;
	my $auth_info = shift || return "";

	my $ua = LWP::UserAgent->new(timeout => 5);
	my $response = $ua->get("http://api.bit.ly/shorten?version=2.0.1&login=".$auth_info->{'login'}."&apiKey=".$auth_info->{'apikey'}."&longUrl=".$url);

	if ($response->is_success) {
		my $j = JSON::Any->new();
		my $bitly = $j->jsonToObj($response->content);

		if ($bitly->{'errorCode'} == 0) {
			return $bitly->{'results'}->{$url}->{'shortUrl'};
		} else {
			return "";
		}
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

sub tbxy2latlong {
	my @tbxy = split(/:/, shift);

	my $lat =  $tbxy[1] * 0.00000274 +  33.172;
	my $long = $tbxy[0] * 0.0000035  - 144.966;

	return { lat => $lat, long => $long }
}

# vim: ts=4
