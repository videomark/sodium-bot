#!/bin/sh
set -e

rm -rf /tmp/.com.google.Chrome.*
rm -rf /tmp/.org.chromium.Chromium.*

if [ -f /tmp/supervisord.pid ]; then
  kill "$(cat /tmp/supervisord.pid)"
fi
