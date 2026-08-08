import http from 'node:http';
import { exec, spawn } from 'node:child_process';
import { parse } from 'node:url';
import {
  UNAUTHORIZED_HTML,
  BUILD_HEADER_HTML,
  renderSkippedHtml,
  renderDashboardHtml
} from './template.mjs';

const PORT = 9876;
const PROJECT_DIR = '/home/dg/core_dir/deployment/projects/AutoJobAgent';
const DEPLOY_KEY = process.env.DEPLOY_KEY || 'd8f9a2e4b7c10395e86d4b21a7f0e39c5812b467a9d0e132f485c7a9b01e23f4';

let isDeploying = false;
let buildLogs = '';
let activeListeners = new Set();

function broadcastData(chunk) {
  buildLogs += chunk;
  for (const res of activeListeners) {
    try {
      const sanitized = chunk.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      res.write(sanitized);
    } catch (e) {
      activeListeners.delete(res);
    }
  }
}

function broadcastEnd(code, messageHtml) {
  const statusHtml = messageHtml || (code === 0
    ? `</pre><div class="status-badge bg-success">✅ Deployment Completed Successfully!</div></div></body></html>`
    : `</pre><div class="status-badge bg-error">❌ Deployment Failed (Exit Code: ${code})</div></div></body></html>`);

  for (const res of activeListeners) {
    try {
      res.write(statusHtml);
      res.end();
    } catch (e) {}
  }
  activeListeners.clear();
  isDeploying = false;
}

function startDeployment(force = false, key = '') {
  isDeploying = true;
  buildLogs = '';

  broadcastData(`Fetching latest origin/main branch status...\n`);

  exec(`cd ${PROJECT_DIR} && git fetch origin main && git rev-parse HEAD && git rev-parse origin/main`, (err, stdout, stderr) => {
    if (err && !force) {
      broadcastData(`Git fetch warning: ${stderr || err.message}\nProceeding with build...\n`);
    }

    let hasChanges = true;
    if (stdout) {
      const lines = stdout.trim().split('\n').filter(Boolean);
      if (lines.length >= 2) {
        const localHash = lines[lines.length - 2].trim();
        const remoteHash = lines[lines.length - 1].trim();
        hasChanges = (localHash !== remoteHash);
        broadcastData(`Local commit:  ${localHash.substring(0, 7)}\nRemote commit: ${remoteHash.substring(0, 7)}\n`);
      }
    }

    if (!hasChanges && !force) {
      broadcastData(`\nℹ️ Local repository is already up to date with origin/main.\nNo new commits found.\n`);
      broadcastEnd(0, renderSkippedHtml(key));
      return;
    }

    broadcastData(`\nExecuting: git pull origin main && docker compose up -d --build\n\n`);

    const command = `cd ${PROJECT_DIR} && git pull origin main && docker compose --env-file .env.production --env-file .env -f docker/compose.yml up -d --build`;

    const child = spawn('bash', ['-c', command]);

    child.stdout.on('data', (data) => broadcastData(data.toString()));
    child.stderr.on('data', (data) => broadcastData(data.toString()));

    child.on('close', (code) => broadcastEnd(code));
    child.on('error', (err) => {
      broadcastData(`\nProcess Error: ${err.message}\n`);
      broadcastEnd(1);
    });
  });
}

const server = http.createServer((req, res) => {
  const parsedUrl = parse(req.url, true);
  const path = parsedUrl.pathname;
  const query = parsedUrl.query;
  const key = query.key || (req.headers['x-deploy-key'] ? req.headers['x-deploy-key'] : '');
  const action = query.action || '';
  const force = query.force === 'true';

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Deploy-Key');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (path === '/trigger' || path === '/trigger/') {
    if (!key || key !== DEPLOY_KEY) {
      res.writeHead(401, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(UNAUTHORIZED_HTML);
      return;
    }

    // If build is in progress or explicit build action requested
    if (isDeploying || action === 'build' || req.method === 'POST') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.write(BUILD_HEADER_HTML);

      activeListeners.add(res);
      req.on('close', () => activeListeners.delete(res));

      if (isDeploying) {
        res.write(`<div class="status-badge bg-info">⏳ Joining Active Build Session...</div><pre>`);
        const sanitizedCurrentLogs = buildLogs.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        res.write(sanitizedCurrentLogs);
      } else {
        res.write(`<div class="status-badge bg-info">Checking Repository Updates...</div><pre>`);
        startDeployment(force, key);
      }
      return;
    }

    // Confirmation dashboard screen
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderDashboardHtml(key));
    return;
  }

  if (path === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', deploying: isDeploying }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Deploy listener running on port ${PORT}`);
});
