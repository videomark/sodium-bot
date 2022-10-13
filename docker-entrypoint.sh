#!/bin/sh
set -e

if [ -z "$(command -v "${1}")" ]; then
  xvfb-run --server-args='-screen 0 1920x1080x24' npm run -- "$@"
  exit $?
fi

exec "$@"
