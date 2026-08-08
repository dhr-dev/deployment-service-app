#!/usr/bin/env bash

MONITOR_DIR="/home/dg/core_dir/deployment/websites/monitor"

echo "Stopping monitor deploy listener..."
if pkill -f "node ${MONITOR_DIR}/server.mjs"; then
  echo "🛑 Monitor server stopped."
else
  echo "ℹ️ Monitor server was not running."
fi
