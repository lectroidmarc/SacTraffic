
SDK_URL=http://localhost:8082/_ah/remote_api

all:
	appcfg.py upload_data \
		--application=sactraffic \
		--kind=Camera \
		--filename=cameras.txt \
		--config_file=bulkloader.yaml \
		--url=${SDK_URL}

clean:
	rm -f bulkloader-*
