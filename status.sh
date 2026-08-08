#!/usr/bin/env bash

MONITOR_DIR="/home/dg/core_dir/deployment/websites/monitor"

if pgrep -f "node ${MONITOR_DIR}/server.mjs" > /dev/null; then
  echo "🟢 Monitor server is RUNNING."
  curl -s http://localhost:9876/health | echo ""
else
  echo "🔴 Monitor server is STOPPED."
fi
