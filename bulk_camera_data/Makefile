
APP_ID=lectroid-sactraffic
SDK_URL=http://localhost:8080/_ah/remote_api
LIVE_URL=http://lectroid-sactraffic.appspot.com/_ah/remote_api

UPLOAD_CMD=appcfg.py upload_data \
	--kind=Camera \
	--filename=cameras.txt \
	--config_file=bulkloader.yaml

local:
	${UPLOAD_CMD} --application=dev~${APP_ID} --url=${SDK_URL}

live:
	${UPLOAD_CMD} --application=${APP_ID} --url=${LIVE_URL}

clean:
	rm -f bulkloader-*
