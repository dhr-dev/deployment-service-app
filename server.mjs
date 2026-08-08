import http from 'node:http';
import { exec, spawn } from 'node:child_process';
import { parse } from 'node:url';

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
      
      const skippedHtml = `</pre>
        <div class="status-badge bg-warning">ℹ️ No New Updates Found - Build Skipped</div>
        <p style="color:#9ca3af; margin-top:1rem;">Repository is already at the latest commit. No container rebuild was necessary.</p>
        <a href="/trigger?key=${encodeURIComponent(key)}&action=build&force=true" style="display:inline-block; padding:0.6rem 1.2rem; background:#374151; color:#f3f4f6; border-radius:6px; text-decoration:none; font-weight:bold; font-size:0.9rem;">⚡ Force Rebuild Containers Anyway</a>
      </div></body></html>`;

      broadcastEnd(0, skippedHtml);
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
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>401 Unauthorized</title>
          <style>
            body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { background: #1e293b; padding: 2rem; border-radius: 12px; border: 1px solid #334155; text-align: center; max-width: 420px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
            h2 { color: #ef4444; margin-top: 0; }
            p { color: #94a3b8; line-height: 1.5; }
            code { background: #0f172a; padding: 4px 8px; border-radius: 4px; color: #38bdf8; word-break: break-all; font-size: 0.85rem; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>⛔ 401 Unauthorized</h2>
            <p>Invalid or missing secret key.</p>
          </div>
        </body>
        </html>
      `);
      return;
    }

    // If build is in progress or explicit build action requested
    if (isDeploying || action === 'build' || req.method === 'POST') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Deploying AutoJobAgent...</title>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Courier New', monospace; background: #090d16; color: #e2e8f0; padding: 2rem; margin: 0; }
            .container { max-width: 900px; margin: 0 auto; background: #111827; border: 1px solid #1f2937; border-radius: 8px; padding: 1.5rem; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
            h1 { color: #38bdf8; font-size: 1.5rem; border-bottom: 1px solid #1f2937; padding-bottom: 0.75rem; margin-top: 0; }
            pre { background: #030712; padding: 1rem; border-radius: 6px; color: #4ade80; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word; font-size: 0.9rem; line-height: 1.5; border: 1px solid #111827; }
            .status-badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-weight: bold; font-size: 0.85rem; margin-bottom: 1rem; }
            .bg-success { background: #166534; color: #4ade80; }
            .bg-warning { background: #854d0e; color: #fef08a; }
            .bg-error { background: #991b1b; color: #fca5a5; }
            .bg-info { background: #1e40af; color: #93c5fd; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🚀 AutoJobAgent Deployment</h1>
      `);

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
    res.end(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Deployment Control Panel</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b0f19; color: #f3f4f6; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1rem; }
          .card { background: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 2.5rem; width: 100%; max-width: 480px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); text-align: center; }
          h1 { font-size: 1.5rem; font-weight: 700; margin-top: 0; color: #38bdf8; }
          .badge { display: inline-block; background: #166534; color: #4ade80; padding: 4px 12px; border-radius: 9999px; font-size: 0.85rem; font-weight: bold; margin-bottom: 1.5rem; }
          p { color: #9ca3af; font-size: 0.95rem; line-height: 1.5; margin-bottom: 2rem; }
          .btn-deploy { display: block; width: 100%; padding: 1rem; background: #2563eb; color: white; border: none; border-radius: 8px; font-size: 1.1rem; font-weight: 700; cursor: pointer; text-decoration: none; transition: background 0.2s, transform 0.1s; box-sizing: border-box; }
          .btn-deploy:hover { background: #1d4ed8; }
          .btn-deploy:active { transform: scale(0.98); }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>🚀 AutoJobAgent Deployer</h1>
          <div class="badge">🔒 Secret Key Verified</div>
          <p>Click below to check for updates on <code>main</code> branch and trigger container rebuilds.</p>

          <a href="/trigger?key=${encodeURIComponent(key)}&action=build" class="btn-deploy">▶ Check Updates & Deploy Now</a>
        </div>
      </body>
      </html>
    `);
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
