#
# Build a zip file suitable for the Chrome store
#

all: sactraffic.zip

sactraffic.zip: hosted_app/manifest.json
	zip -r sactraffic.zip hosted_app -x *.DS_Store

clean:
	rm sactraffic.zip
