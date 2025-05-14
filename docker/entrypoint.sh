#!/usr/bin/env sh
set -eu

cp -nR /usr/src/app/ /
chown -R root:root /app
cd /app
NODE_ENV=production node dist/main
