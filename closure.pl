#!/usr/bin/perl

#
# Closure Compiler API wrapper
#
# A wrapper for the Google Closure Compiler web service.
#
# See: http://code.google.com/closure/compiler/docs/api-ref.html
#

use strict;
use warnings;

use Getopt::Std;
use LWP::UserAgent;
use JSON::Any;

use Data::Dumper;

# Args...
our($opt_c, $opt_o);
# -c <level>:	compilation level (default: SIMPLE_OPTIMIZATIONS)
# -o <file>:	output file
getopts('c:o:');

# Ok, really, we need data of course...
usage() unless @ARGV;

my $compiler_args = [
	'output_format' => 'json',
	'output_info' => 'compiled_code',
	'output_info' => 'warnings',
	'output_info' => 'errors',
	'output_info' => 'statistics',
	'compilation_level' => $opt_c || 'SIMPLE_OPTIMIZATIONS'
];

# Get the conetnts of the files on the command line...
foreach (@ARGV) {
	if (/^http/) {
		# is a URL
		push (@$compiler_args, 'code_url' => $_);
	} else {
		# is a file path
		my $js_code;

		local $/;
		open (FILE, "<".$_) || die $!;
		$js_code .= <FILE>;
		close (FILE);

		push (@$compiler_args, 'js_code' => $js_code);
	}
}

# Do it!
my $ua = LWP::UserAgent->new();
my $response = $ua->post("http://closure-compiler.appspot.com/compile", $compiler_args);

# Handle the response...
if ($response->is_success) {
	# Work around an issue wuth JSON::Any choking on tabs
	my $raw_content = $response->decoded_content;
	$raw_content =~ s/\t/    /g;

	my $j = JSON::Any->new();
	my $closure_output = $j->jsonToObj($raw_content);

	# Errors take precedent, if we have errors then all else is moot
	if ($closure_output->{'serverErrors'}) {
		print STDERR "Server Errors:\n";
		foreach my $serverError (@{$closure_output->{'serverErrors'}}) {
			print STDERR "  Error code ".$serverError->{'code'}.": ".$serverError->{'error'}."\n";
		}
		exit 255;
	} elsif ($closure_output->{'errors'}) {
		print STDERR "Javascript Errors:\n";
		foreach my $error (@{$closure_output->{'errors'}}) {
			print STDERR "  ".$error->{'error'}." in ".$error->{'file'}." on line ".$error->{'lineno'}."\n";
		}
		exit 255;
	} else {
		# If we have a valid output file, write to it, else to STDOUT
		if ($opt_o && -w $opt_o) {
			open (FILE, ">".$opt_o);
			print FILE $closure_output->{'compiledCode'};
			close (FILE);
		} else {
			print $closure_output->{'compiledCode'};	# This to STDOUT
		}

		# Show warnings
		if ($closure_output->{'warnings'}) {
			print STDERR "Warnings:\n";
			foreach my $warning (@{$closure_output->{'warnings'}}) {
				print STDERR "  ".$warning->{'warning'}." in ".$warning->{'file'}." on line ".$warning->{'lineno'}."\n";
			}
		}

		# Finally, show the stats
		print STDERR "Compile Time: ".$closure_output->{'statistics'}->{'compileTime'}." seconds.\n";
		print STDERR "Original Size: ".$closure_output->{'statistics'}->{'originalSize'}." bytes\n";
		print STDERR "Compressed Size: ".$closure_output->{'statistics'}->{'compressedSize'}." bytes\n";
	}

	#print Dumper ($closure_output);
} else {
	die $response->status_line;
}


sub usage {
	print "Usage: $0 [options] <file>...\n";
	print "  -c <WHITESPACE_ONLY|SIMPLE_OPTIMIZATIONS|ADVANCED_OPTIMIZATIONS>:  sets the compilation level\n";
	print "  -o <file>: the file to output to.\n";
	exit;
}
