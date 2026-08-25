import http from 'node:http';
import { exec, spawn } from 'node:child_process';
import { parse } from 'node:url';
import crypto from 'node:crypto';
import {
  UNAUTHORIZED_HTML,
  BUILD_HEADER_HTML,
  TRIGGER_DISABLED_HTML,
  renderSkippedHtml,
  renderDashboardHtml,
  renderWatchIdleHtml,
  renderWatchPageHtml
} from './template.mjs';

const PORT = 9876;
const HOST = '0.0.0.0'; // Bind to 0.0.0.0 so Nginx container (shared_nginx) can reach via host.docker.internal:9876
const PROJECT_DIR = '/home/dg/core_dir/deployment/projects/AutoJobAgent';

// Secret keys
const DEPLOY_ADMIN_KEY = process.env.DEPLOY_KEY || 'd8f9a2e4b7c10395e86d4b21a7f0e39c5812b467a9d0e132f485c7a9b01e23f4';
const DEPLOY_VIEW_KEY = process.env.DEPLOY_VIEW_KEY || 'a3c7f910e52b84d6190ec3851724fa09e8b1d4c2a5e903f716284b9015c3d7ea';

// Deploy trigger toggle (disabled as requested while preserving execution code)
const ENABLE_DEPLOY_TRIGGER = process.env.ENABLE_DEPLOY_TRIGGER === 'true' || false;

let isDeploying = false;
let buildLogs = '';
let lastDeployTimestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';
let lastCommit = '';
let lastStatus = 'All Systems Operational';
let activeListeners = new Set();

/**
 * Constant-time comparison using SHA-256 digest buffers.
 * Protects against side-channel timing attacks.
 */
function safeCompare(provided, expected) {
  if (!provided || typeof provided !== 'string') return false;
  const hashA = crypto.createHash('sha256').update(String(provided)).digest();
  const hashB = crypto.createHash('sha256').update(String(expected)).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

/**
 * Derives a dynamic per-commit token using HMAC-SHA256 fusion.
 * Combines secret key + git commit SHA to create a secure, unguessable watch token.
 */
function computeFusedToken(secret, commit) {
  if (!secret || !commit || typeof commit !== 'string') return '';
  const shortCommit = commit.trim().substring(0, 7).toLowerCase();
  return crypto.createHmac('sha256', String(secret)).update(shortCommit).digest('hex').substring(0, 32);
}

function validateKey(key, commit = '') {
  if (!key) return false;
  
  // 1. Exact view key match
  if (safeCompare(key, DEPLOY_VIEW_KEY)) return true;
  
  // 2. Exact admin deploy key match
  if (safeCompare(key, DEPLOY_ADMIN_KEY)) return true;

  // 3. Dynamic HMAC-SHA256 per-commit fused token match
  if (commit) {
    const fusedViewToken = computeFusedToken(DEPLOY_VIEW_KEY, commit);
    const fusedAdminToken = computeFusedToken(DEPLOY_ADMIN_KEY, commit);
    if (safeCompare(key, fusedViewToken) || safeCompare(key, fusedAdminToken)) return true;

    // Backward compatibility with legacy format
    if (safeCompare(key, `${DEPLOY_VIEW_KEY}_${commit}`)) return true;
  }

  return false;
}

function broadcastData(chunk) {
  buildLogs += chunk;
  const sanitized = chunk.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  for (const res of activeListeners) {
    try {
      res.write(sanitized);
      if (typeof res.flush === 'function') res.flush();
    } catch (e) {
      activeListeners.delete(res);
    }
  }
}

function broadcastEnd(code, messageHtml) {
  lastDeployTimestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST';
  lastStatus = code === 0 ? 'Deployment Succeeded' : `Deployment Failed (Exit: ${code})`;

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
        lastCommit = remoteHash.substring(0, 7);
        broadcastData(`Local commit:  ${localHash.substring(0, 7)}\nRemote commit: ${remoteHash.substring(0, 7)}\n`);
      }
    }

    if (!hasChanges && !force) {
      broadcastData(`\nℹ️ Local repository is already up to date with origin/main.\nNo new commits found.\n`);
      broadcastEnd(0, renderSkippedHtml(key));
      return;
    }

    broadcastData(`\nExecuting: git pull origin main && BUILDKIT_PROGRESS=plain docker compose up -d --build\n\n`);

    const command = `cd ${PROJECT_DIR} && git pull origin main && export BUILDKIT_PROGRESS=plain && export FORCE_COLOR=0 && docker compose --env-file .env.portainer -f docker/compose.yml up -d --build`;

    const child = spawn('bash', ['-c', command], {
      env: { ...process.env, BUILDKIT_PROGRESS: 'plain', FORCE_COLOR: '0' }
    });

    child.stdout.on('data', (data) => broadcastData(data.toString()));
    child.stderr.on('data', (data) => broadcastData(data.toString()));

    child.on('close', (code) => broadcastEnd(code));
    child.on('error', (err) => {
      broadcastData(`\nProcess Error: ${err.message}\n`);
      broadcastEnd(1);
    });
  });
}

function getContainerStatuses(callback) {
  exec(`docker ps --format "{{.Names}}|{{.Status}}" --filter "name=tz_"`, (err, stdout) => {
    if (err || !stdout) {
      callback([]);
      return;
    }
    const list = stdout.trim().split('\n').filter(Boolean).map(line => {
      const [name, status] = line.split('|');
      return { name: name?.trim() || '', status: status?.trim() || '' };
    });
    callback(list);
  });
}

const server = http.createServer((req, res) => {
  const parsedUrl = parse(req.url, true);
  const path = parsedUrl.pathname;
  const query = parsedUrl.query;
  const key = query.key || (req.headers['x-deploy-key'] ? req.headers['x-deploy-key'] : '');
  const commit = query.commit || '';
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

  // 1. Health endpoint
  if (path === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      deploying: isDeploying,
      lastStatus,
      lastCommit,
      lastDeployTimestamp
    }));
    return;
  }

  // 2. Read-only live watch page (/watch)
  if (path === '/watch' || path === '/watch/') {
    if (!validateKey(key, commit)) {
      res.writeHead(401, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(UNAUTHORIZED_HTML);
      return;
    }

    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform'
    });
    res.end(renderWatchPageHtml({ key, commit }));
    return;
  }

  // 2b. Live logs stream reader (/stream or /api/logs/stream)
  if (path === '/stream' || path === '/api/logs/stream') {
    if (!validateKey(key, commit)) {
      res.writeHead(401, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Unauthorized');
      return;
    }

    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-cache, no-transform'
    });
    if (typeof res.flushHeaders === 'function') res.flushHeaders();

    const logProcess = spawn('docker', ['compose', '--env-file', `${PROJECT_DIR}/.env.portainer`, '-f', `${PROJECT_DIR}/docker/compose.yml`, 'logs', '-f', '--tail', '100'], { cwd: PROJECT_DIR });

    const streamData = (data) => {
      try {
        res.write(data);
        if (typeof res.flush === 'function') res.flush();
      } catch (e) {}
    };

    logProcess.stdout.on('data', streamData);
    logProcess.stderr.on('data', streamData);

    req.on('close', () => {
      try {
        logProcess.kill('SIGTERM');
      } catch (e) {}
    });
    return;
  }

  // 3. Deploy Trigger Endpoint (/trigger)
  if (path === '/trigger' || path === '/trigger/') {
    if (!safeCompare(key, DEPLOY_ADMIN_KEY)) {
      res.writeHead(401, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(UNAUTHORIZED_HTML);
      return;
    }

    // Check if trigger is currently disabled
    if (!ENABLE_DEPLOY_TRIGGER && action === 'build') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(TRIGGER_DISABLED_HTML);
      return;
    }

    // If build is in progress or explicit build action requested and enabled
    if (isDeploying || (ENABLE_DEPLOY_TRIGGER && (action === 'build' || req.method === 'POST'))) {
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-cache, no-transform'
      });
      res.write(BUILD_HEADER_HTML);
      if (typeof res.flushHeaders === 'function') res.flushHeaders();

      activeListeners.add(res);
      req.on('close', () => activeListeners.delete(res));

      if (isDeploying) {
        res.write(`<div class="status-badge bg-info">⏳ Joining Active Build Session...</div><pre id="log-output">`);
        const sanitizedCurrentLogs = buildLogs.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        res.write(sanitizedCurrentLogs);
      } else {
        res.write(`<div class="status-badge bg-info">Checking Repository Updates...</div><pre id="log-output">`);
        startDeployment(force, key);
      }
      return;
    }

    // Admin confirmation screen
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderDashboardHtml(key));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, HOST, () => {
  console.log(`Deploy listener running securely on http://${HOST}:${PORT}`);
});
