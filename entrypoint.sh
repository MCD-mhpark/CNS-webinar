#! /bin/bash

cd /home/src/webinar/bin/
NODE_PORT=8001 pm2 start --name LGCNS_Webinar ./www --watch

