#!/usr/bin/env bash

MONITOR_DIR="/home/dg/core_dir/deployment/websites/monitor"
LOG_FILE="${MONITOR_DIR}/deploy_listener.log"

echo "Checking if monitor server is already running..."
pkill -f "node ${MONITOR_DIR}/server.mjs" 2>/dev/null || true

sleep 1

echo "Starting monitor deploy listener on port 9876..."
nohup /home/dg/.nvm/versions/node/v24.14.0/bin/node "${MONITOR_DIR}/server.mjs" > "${LOG_FILE}" 2>&1 &

sleep 1

if pgrep -f "node ${MONITOR_DIR}/server.mjs" > /dev/null; then
  echo "✅ Monitor server started successfully!"
  echo "Log file: ${LOG_FILE}"
else
  echo "❌ Failed to start monitor server. Check ${LOG_FILE}"
fi
