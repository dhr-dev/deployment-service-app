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

export function renderWatchPageHtml({ key = '', commit = '' }) {
  return `<!DOCTYPE html>
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
    .log-row {
      display: block;
      padding: 4px 8px;
      border-radius: 4px;
      margin: 3px 0;
      word-break: break-all;
      white-space: pre-wrap;
      font-family: inherit;
      position: relative;
      cursor: pointer;
      user-select: text;
      -webkit-user-select: text;
      -webkit-touch-callout: none;
      touch-action: pan-y;
      transition: filter 0.15s ease;
    }
    .log-row.line-even { background: #1e293b !important; color: #38bdf8 !important; border-left: 3px solid #0284c7 !important; } /* Row 1: Slate Blue / Cyan */
    .log-row.line-odd  { background: #0b0f19 !important; color: #4ade80 !important; border-left: 3px solid #16a34a !important; } /* Row 2: Deep Charcoal / Green */

    @media (hover: none), (pointer: coarse) {
      .log-row {
        cursor: default;
      }
    }

    /* Copy Button & Interactive Log Line Styling */
    .btn-copy-all { background: #1e293b; color: #38bdf8; border: 1px solid #0284c7; padding: 5px 12px; border-radius: 6px; font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: background 0.15s ease, transform 0.1s ease; font-family: system-ui, -apple-system, sans-serif; }
    .btn-copy-all:hover { background: #0284c7; color: #ffffff; }
    .btn-copy-all:active { transform: scale(0.96); }

    .log-row:hover { filter: brightness(1.25); }
    .log-row::after { content: '📋 Copy'; position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: #0f172a; color: #94a3b8; font-size: 0.72rem; font-weight: 600; padding: 2px 8px; border-radius: 4px; border: 1px solid #334155; opacity: 0; pointer-events: none; transition: opacity 0.15s ease; font-family: system-ui, -apple-system, sans-serif; }
    @media (min-width: 640px) {
      body { padding: 1.5rem 1rem; }
      .container { padding: 1.5rem; border-radius: 12px; }
      .header { padding-bottom: 0.75rem; margin-bottom: 1rem; }
      h1 { font-size: 1.3rem; }
      pre { padding: 0.75rem; font-size: 0.88rem; line-height: 1.5; }
      .status-badge { font-size: 0.85rem; margin-bottom: 0; padding: 4px 12px; }
      .log-row { padding: 5px 10px; margin: 3px 0; }
      .log-row:hover::after { opacity: 1; }
    }
    .log-row.copied::after { content: '✅ Copied!'; background: #166534 !important; color: #4ade80 !important; border-color: #22c55e !important; opacity: 1 !important; }

    /* Copy Toast */
    #copy-toast {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background: #0f172a;
      color: #e2e8f0;
      border: 1px solid #334155;
      padding: 8px 18px;
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 700;
      font-family: system-ui, -apple-system, sans-serif;
      box-shadow: 0 10px 25px rgba(0,0,0,0.6);
      opacity: 0;
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
      z-index: 9999;
      pointer-events: none;
    }

    #copy-toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }
    #copy-toast.copy-success { background: #14532d; color: #86efac; border-color: #22c55e; }
    #copy-toast.copy-failed { background: #7f1d1d; color: #fecaca; border-color: #ef4444; }
  </style>
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      let toastTimer = null;

      function showToast(message, isSuccess) {
        let toast = document.getElementById('copy-toast');
        if (!toast) {
          toast = document.createElement('div');
          toast.id = 'copy-toast';
          document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.toggle('copy-success', !!isSuccess);
        toast.classList.toggle('copy-failed', !isSuccess);
        toast.classList.add('show');
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(() => { toast.classList.remove('show'); }, 2000);
      }

      function copyText(text) {
        if (typeof text !== 'string' || !text.length) return false;
        const textarea = document.createElement('textarea');
        try {
          textarea.value = text;
          textarea.setAttribute('readonly', '');
          textarea.style.position = 'fixed';
          textarea.style.top = '0';
          textarea.style.left = '0';
          textarea.style.width = '1px';
          textarea.style.height = '1px';
          textarea.style.padding = '0';
          textarea.style.border = '0';
          textarea.style.opacity = '0';
          textarea.style.zIndex = '-1';
          document.body.appendChild(textarea);
          textarea.focus();
          textarea.select();
          textarea.setSelectionRange(0, textarea.value.length);
          return document.execCommand('copy') === true;
        } catch (error) {
          console.error('Copy failed:', error);
          return false;
        } finally {
          const selection = window.getSelection();
          if (selection) selection.removeAllRanges();
          if (textarea.parentNode) textarea.parentNode.removeChild(textarea);
        }
      }

      function handleCopy(text, rowElement, successMessage) {
        const success = copyText(text);
        if (success) {
          if (rowElement) {
            rowElement.classList.add('copied');
            setTimeout(() => { rowElement.classList.remove('copied'); }, 1500);
          }
          showToast(successMessage, true);
        } else {
          showToast('⚠️ Copy failed', false);
        }
        return success;
      }

      let lastTouchTime = 0;

      // Desktop / Mouse Click (Log Row & Copy All)
      document.addEventListener('click', (event) => {
        const copyAllButton = event.target.closest('#copy-all-btn');
        if (copyAllButton) {
          const logOutput = document.getElementById('log-output');
          const allText = logOutput ? logOutput.textContent : '';
          handleCopy(allText, null, '📋 Copied full log!');
          return;
        }

        // Suppress synthetic clicks triggered after mobile touch
        if (Date.now() - lastTouchTime < 600) {
          return;
        }

        const row = event.target.closest('.log-row');
        if (row) {
          handleCopy(row.textContent, row, '📋 Copied log line!');
        }
      });

      // Mobile double-tap
      const DOUBLE_TAP_DELAY = 320;
      const MAX_TAP_MOVEMENT = 15;
      let activeRow = null;
      let touchStartX = 0;
      let touchStartY = 0;
      let movedTooFar = false;
      let lastTapTime = 0;
      let lastTappedRow = null;

      document.addEventListener('touchstart', (event) => {
        lastTouchTime = Date.now();
        const row = event.target.closest('.log-row');
        const touch = event.changedTouches[0];
        activeRow = row || null;
        movedTooFar = false;
        if (!row || !touch) return;
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
      }, { passive: true });

      document.addEventListener('touchmove', (event) => {
        lastTouchTime = Date.now();
        if (!activeRow || movedTooFar) return;
        const touch = event.changedTouches[0];
        if (!touch) return;
        const deltaX = Math.abs(touch.clientX - touchStartX);
        const deltaY = Math.abs(touch.clientY - touchStartY);
        if (deltaX > MAX_TAP_MOVEMENT || deltaY > MAX_TAP_MOVEMENT) {
          movedTooFar = true;
          lastTapTime = 0;
          lastTappedRow = null;
        }
      }, { passive: true });

      document.addEventListener('touchcancel', () => {
        lastTouchTime = Date.now();
        activeRow = null;
        movedTooFar = true;
        lastTapTime = 0;
        lastTappedRow = null;
      }, { passive: true });

      document.addEventListener('touchend', (event) => {
        lastTouchTime = Date.now();
        const row = activeRow;
        const touch = event.changedTouches[0];
        activeRow = null;
        if (!row || !touch || movedTooFar) return;
        const now = Date.now();
        const isDoubleTap = lastTappedRow === row && lastTapTime > 0 && (now - lastTapTime) <= DOUBLE_TAP_DELAY;
        if (isDoubleTap) {
          lastTapTime = 0;
          lastTappedRow = null;
          handleCopy(row.textContent, row, '📋 Copied log line!');
          if (navigator.vibrate) navigator.vibrate(50);
          return;
        }
        lastTapTime = now;
        lastTappedRow = row;
      }, { passive: true });

      // Auto-scroll (contained within terminal pre element)
      const scrollToBottom = () => {
        const logEl = document.getElementById('log-output');
        if (logEl) {
          logEl.scrollTop = logEl.scrollHeight;
        }
      };

      // Live Stream Reader (Background fetch stream)
      async function startLogStream() {
        const urlParams = new URLSearchParams(window.location.search);
        const key = urlParams.get('key') || '';
        const commit = urlParams.get('commit') || '';
        const streamUrl = '/stream?key=' + encodeURIComponent(key) + '&commit=' + encodeURIComponent(commit);

        try {
          const response = await fetch(streamUrl);
          if (!response.ok) {
            console.error('Stream response not ok:', response.status);
            return;
          }
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let lineIndex = 0;
          let buffer = '';

          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\\n');
            buffer = lines.pop();

            const logEl = document.getElementById('log-output');
            if (!logEl) continue;

            const fragment = document.createDocumentFragment();
            for (const line of lines) {
              if (!line && lines.length === 1) continue;
              const row = document.createElement('span');
              row.className = 'log-row ' + (lineIndex++ % 2 === 0 ? 'line-even' : 'line-odd');
              row.textContent = line;
              fragment.appendChild(row);
            }
            logEl.appendChild(fragment);
            scrollToBottom();
          }
        } catch (err) {
          console.error('Stream error:', err);
          setTimeout(startLogStream, 3000);
        }
      }

      startLogStream();
    });
  </script>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
        <h1>🚀 AutoJobAgent Live Deployment Stream</h1>
        <span class="status-badge bg-info pulse">● LIVE STREAM</span>
      </div>
      <button id="copy-all-btn" class="btn-copy-all">📋 Copy All Logs</button>
    </div>
    <div class="status-badge bg-info">⏳ Connected to Live Portainer Container Stream...</div>
    <pre id="log-output"></pre>
  </div>
</body>
</html>`;
}

export const BUILD_HEADER_HTML = renderWatchPageHtml({});

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
