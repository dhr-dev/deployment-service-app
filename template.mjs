export const UNAUTHORIZED_HTML = `<!DOCTYPE html>
<html>
<head>
  <title>401 Unauthorized</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #0b0f19; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 1rem; box-sizing: border-box; }
    .card { background: #111827; padding: 2.5rem; border-radius: 14px; border: 1px solid #1f2937; text-align: center; max-width: 440px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
    h2 { color: #ef4444; margin-top: 0; font-size: 1.4rem; }
    p { color: #94a3b8; line-height: 1.5; font-size: 0.95rem; }
  </style>
</head>
<body>
  <div class="card">
    <h2>⛔ 401 Unauthorized</h2>
    <p>Invalid or missing access key. Access to this endpoint is restricted.</p>
  </div>
</body>
</html>`;

export const BUILD_HEADER_HTML = `<!DOCTYPE html>
<html>
<head>
  <title>AutoJobAgent Deployment Stream</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; }
    body { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Courier New", monospace; background: #090d16; color: #e2e8f0; padding: 0.5rem 0.25rem; margin: 0; min-height: 100vh; }
    .container { max-width: 1100px; margin: 0 auto; background: #111827; border: 1px solid #1f2937; border-radius: 10px; padding: 0.75rem 0.6rem; box-shadow: 0 10px 25px rgba(0,0,0,0.5); width: 100%; }
    .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1f2937; padding-bottom: 0.6rem; margin-bottom: 0.6rem; flex-wrap: wrap; gap: 8px; }
    h1 { color: #38bdf8; font-size: 1.05rem; margin: 0; font-family: system-ui, -apple-system, sans-serif; font-weight: 700; }
    pre { background: #030712; padding: 0.5rem 0.25rem; border-radius: 8px; color: #e2e8f0; overflow-x: auto; font-size: 0.8rem; line-height: 1.5; border: 1px solid #1f2937; max-height: 82vh; margin: 0; }
    .status-badge { display: inline-block; padding: 3px 10px; border-radius: 9999px; font-weight: bold; font-size: 0.78rem; margin-bottom: 0.6rem; font-family: system-ui, -apple-system, sans-serif; }
    .bg-success { background: #166534; color: #4ade80; }
    .bg-warning { background: #854d0e; color: #fef08a; }
    .bg-error { background: #991b1b; color: #fca5a5; }
    .bg-info { background: #1e40af; color: #93c5fd; }
    .pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }

    /* Zebra Striping (Alternating Excel-style odd/even log rows) */
    .log-row { display: block; padding: 4px 8px; border-radius: 4px; margin: 3px 0; word-break: break-all; white-space: pre-wrap; font-family: inherit; }
    .log-row.line-even { background: #1e293b !important; color: #38bdf8 !important; border-left: 3px solid #0284c7 !important; } /* Row 1: Slate Blue / Cyan */
    .log-row.line-odd  { background: #0b0f19 !important; color: #4ade80 !important; border-left: 3px solid #16a34a !important; } /* Row 2: Deep Charcoal / Green */

    @media (min-width: 640px) {
      body { padding: 1.5rem 1rem; }
      .container { padding: 1.5rem; border-radius: 12px; }
      .header { padding-bottom: 0.75rem; margin-bottom: 1rem; }
      h1 { font-size: 1.3rem; }
      pre { padding: 0.75rem; font-size: 0.88rem; line-height: 1.5; }
      .status-badge { font-size: 0.85rem; margin-bottom: 1rem; padding: 4px 12px; }
      .log-row { padding: 5px 10px; margin: 3px 0; }
    }
  </style>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const scrollToBottom = () => {
        const el = document.getElementById('log-output');
        if (el) el.scrollTop = el.scrollHeight;
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      };
      const observer = new MutationObserver(scrollToBottom);
      observer.observe(document.body, { childList: true, subtree: true });
      setInterval(scrollToBottom, 500);
    });
  </script>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 AutoJobAgent Live Deployment Stream</h1>
      <span class="status-badge bg-info pulse">● LIVE STREAM</span>
    </div>`;

export const TRIGGER_DISABLED_HTML = `<!DOCTYPE html>
<html>
<head>
  <title>Deploy Trigger Disabled</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #0b0f19; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1rem; box-sizing: border-box; }
    .card { background: #111827; padding: 2.5rem; border-radius: 14px; border: 1px solid #1f2937; text-align: center; max-width: 480px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
    h2 { color: #f59e0b; margin-top: 0; font-size: 1.4rem; }
    p { color: #94a3b8; line-height: 1.5; font-size: 0.95rem; margin-bottom: 1.5rem; }
    .btn { display: inline-block; padding: 0.75rem 1.5rem; background: #2563eb; color: white; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.9rem; }
  </style>
</head>
<body>
  <div class="card">
    <h2>🔒 Direct Deploy Trigger Disabled</h2>
    <p>Automated deployments are currently managed via <strong>Portainer Webhook & GitHub Actions</strong>.<br>Manual trigger via this endpoint is paused.</p>
    <a href="/watch" class="btn">View Live Status (/watch)</a>
  </div>
</body>
</html>`;

export function renderSkippedHtml(key) {
  return `</pre>
    <div class="status-badge bg-warning">ℹ️ No New Updates Found - Build Skipped</div>
    <p style="color:#9ca3af; margin-top:1rem; font-family:system-ui, sans-serif;">Repository is already at the latest commit. No container rebuild was necessary.</p>
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
  </style>
</head>
<body>
  <div class="card">
    <h1>🚀 AutoJobAgent Deployer</h1>
    <div class="badge">🔒 Admin Key Verified</div>
    <p>Manual trigger endpoint is available for administrative rebuilds.</p>
    <a href="/trigger?key=${encodeURIComponent(key)}&action=build" class="btn-deploy">▶ Execute Deployment</a>
  </div>
</body>
</html>`;
}

export function renderWatchIdleHtml({ key, commit, lastStatus, lastTimestamp, containers = [] }) {
  const containerRows = containers.map(c => `
    <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 14px; background:#0f172a; border-radius:8px; margin-bottom:8px; border:1px solid #1e293b;">
      <span style="font-weight:600; font-family:monospace; color:#e2e8f0;">${c.name}</span>
      <span style="font-size:0.8rem; font-weight:700; padding:3px 10px; border-radius:9999px; ${c.status.includes('Up') ? 'background:#14532d; color:#4ade80;' : 'background:#7f1d1d; color:#fca5a5;'}">${c.status}</span>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Deployment Monitor — AutoJobAgent</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b0f19; color: #f3f4f6; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 1rem; box-sizing: border-box; }
    .card { background: #111827; border: 1px solid #1f2937; border-radius: 14px; padding: 2rem; width: 100%; max-width: 520px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
    .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
    h1 { font-size: 1.3rem; font-weight: 700; margin: 0; color: #38bdf8; }
    .badge-idle { background: #14532d; color: #4ade80; padding: 4px 12px; border-radius: 9999px; font-size: 0.8rem; font-weight: 700; }
    .info-box { background: #030712; border: 1px solid #1f2937; border-radius: 10px; padding: 1rem; margin-bottom: 1.5rem; font-size: 0.9rem; }
    .info-row { display: flex; justify-content: space-between; padding: 4px 0; color: #94a3b8; }
    .info-row strong { color: #f1f5f9; }
    .section-title { font-size: 0.85rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem; }
    .footer { text-align: center; margin-top: 1.5rem; font-size: 0.8rem; color: #64748b; }
  </style>
  <script>
    setInterval(async () => {
      try {
        const res = await fetch('/health');
        if (res.ok) {
          const data = await res.json();
          if (data.deploying) {
            window.location.reload();
          }
        }
      } catch (e) {}
    }, 4000);
  </script>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>🚀 TezApply Deployment Monitor</h1>
      <span class="badge-idle">🟢 IDLE / READY</span>
    </div>

    <div class="info-box">
      <div class="info-row">
        <span>Status:</span>
        <strong style="color: #4ade80;">${lastStatus || 'All Services Healthy'}</strong>
      </div>
      ${commit ? `<div class="info-row"><span>Commit:</span><code style="color:#38bdf8;">${commit}</code></div>` : ''}
      ${lastTimestamp ? `<div class="info-row"><span>Last Checked:</span><strong>${lastTimestamp}</strong></div>` : ''}
    </div>

    <div class="section-title">Active Stack Containers</div>
    ${containerRows || '<div style="color:#64748b; font-size:0.9rem;">No active containers detected.</div>'}

    <div class="footer">
      Auto-connects to live stream when a new deployment is triggered.
    </div>
  </div>
</body>
</html>`;
}
