#!/bin/sh
set -e

rm -rf /tmp/playwright_*

if [ -f /tmp/supervisord.pid ]; then
  kill "$(cat /tmp/supervisord.pid)"
  rm -f /tmp/supervisord.pid
fi
