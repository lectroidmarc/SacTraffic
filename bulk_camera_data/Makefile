
APP_ID=lectroid-sactraffic
SDK_URL=http://localhost:8082/_ah/remote_api
LIVE_URL=http://lectroid-sactraffic.appspot.com/_ah/remote_api

UPLOAD_CMD=appcfg.py upload_data \
	--application=${APP_ID} \
	--kind=Camera \
	--filename=cameras.txt \
	--config_file=bulkloader.yaml

local:
	${UPLOAD_CMD} --url=${SDK_URL}

live:
	${UPLOAD_CMD} --url=${LIVE_URL}

clean:
	rm -f bulkloader-*
