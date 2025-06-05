#!/bin/sh
set -e

if [ "${1}" = start ]; then
  shift
  xvfb-run --server-args='-screen 0 1920x1080x24' node --run start -- "$@"
  exit $?
fi

exec "$@"
