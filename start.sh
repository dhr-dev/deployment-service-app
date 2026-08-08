#!/usr/bin/env bash

MONITOR_DIR="/home/dg/core_dir/deployment/websites/monitor"

echo "Checking if monitor server is already running..."
pkill -f "node ${MONITOR_DIR}/server.mjs" 2>/dev/null || true

sleep 1

echo "Starting monitor deploy listener on port 9876..."
nohup node "${MONITOR_DIR}/server.mjs" > /tmp/deploy_listener.log 2>&1 &

sleep 1

if pgrep -f "node ${MONITOR_DIR}/server.mjs" > /dev/null; then
  echo "✅ Monitor server started successfully!"
  echo "Log file: /tmp/deploy_listener.log"
else
  echo "❌ Failed to start monitor server. Check /tmp/deploy_listener.log"
fi
