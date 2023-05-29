#!/bin/sh
set -e

find /app/public \
  -type f \
  -name '*.js' \
  -exec sed -i "s+%%VUE_APP_API_URL%%+${VUE_APP_API_URL:?}+g" '{}' \;

exec /docker-entrypoint.sh "$@"
