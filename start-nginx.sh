#!/bin/sh
set -e
# Default to docker-compose service name so local docker-compose still works
BACKEND_URL="${BACKEND_URL:-http://backend:3000}"
export BACKEND_URL
envsubst '${BACKEND_URL}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'
