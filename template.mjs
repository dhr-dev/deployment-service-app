export const UNAUTHORIZED_HTML = `<!DOCTYPE html>
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
</html>`;

export const BUILD_HEADER_HTML = `<!DOCTYPE html>
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
    <h1>🚀 AutoJobAgent Deployment</h1>`;

export function renderSkippedHtml(key) {
  return `</pre>
    <div class="status-badge bg-warning">ℹ️ No New Updates Found - Build Skipped</div>
    <p style="color:#9ca3af; margin-top:1rem;">Repository is already at the latest commit. No container rebuild was necessary.</p>
    <a href="/trigger?key=${encodeURIComponent(key)}&action=build&force=true" style="display:inline-block; padding:0.6rem 1.2rem; background:#374151; color:#f3f4f6; border-radius:6px; text-decoration:none; font-weight:bold; font-size:0.9rem;">⚡ Force Rebuild Containers Anyway</a>
  </div></body></html>`;
}

export function renderDashboardHtml(key) {
  return `<!DOCTYPE html>
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
</html>`;
}
