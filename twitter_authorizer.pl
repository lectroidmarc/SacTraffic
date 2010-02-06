#!/usr/bin/perl

#
# Get OAuth data for Twitter
#

use strict;
use warnings;
use lib '/home/mmatteo/perl_lib';

use Net::Twitter::Lite;
use XML::Simple;

my $config = XMLin("process_chp-config.xml");

my $nt = Net::Twitter::Lite->new(
	consumer_key    => $config->{'twitter_app'}->{'consumer_key'},
	consumer_secret => $config->{'twitter_app'}->{'consumer_secret'},
);

print "Authorize this app at:\n\n";
print "    ".$nt->get_authorization_url."\n\n";
print "Enter the PIN here: ";

my $pin = <STDIN>; # wait for input
chomp $pin;

my($access_token, $access_token_secret, $user_id, $screen_name) = $nt->request_access_token(verifier => $pin);

print "Put these in your config file and smoke 'em\n";
print "  Access Token: $access_token\n";
print "  Access Token Secret: $access_token_secret\n";
