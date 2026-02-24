/*!
 * Grova Widget v1.1
 * https://grova.dev
 *
 * Drop-in feedback widget for any web app.
 *
 * Usage:
 *   <script src="https://grova.dev/grova-widget.js" data-source="my-app"></script>
 *
 * Optional attributes:
 *   data-source   — identifies your app in the Grova inbox  (default: hostname)
 *   data-position — "right" or "left"                       (default: "right")
 *   data-api-url  — override the API endpoint               (default: https://grova-api-production.up.railway.app/feedback)
 *   data-key      — your Grova project API key for per-project routing
 *   data-no-badge — hide the "Powered by Grova" footer link
 */
(function () {
  'use strict';

  const GROVA_WIDGET_VERSION = '1.1.0';

  if (window.__grovaWidget) return;
  window.__grovaWidget = true;

  // ── Throttle state ────────────────────────────────────────────────────
  let lastSubmitTime = 0;

  // ── Console error capture (ring buffer of last 10) ─────────────────────

  const _grovaErrors = [];
  const MAX_ERRORS = 10;

  function pushError(entry) {
    if (_grovaErrors.length >= MAX_ERRORS) _grovaErrors.shift();
    _grovaErrors.push(entry);
  }

  window.addEventListener('error', (e) => {
    pushError({
      message:   e.message || 'Unknown error',
      source:    e.filename || '',
      line:      e.lineno || 0,
      col:       e.colno || 0,
      timestamp: new Date().toISOString(),
    });
  });

  window.addEventListener('unhandledrejection', (e) => {
    pushError({
      message:   e.reason?.message || e.reason?.toString() || 'Unhandled rejection',
      source:    'promise',
      line:      0,
      col:       0,
      timestamp: new Date().toISOString(),
    });
  });

  // ── Metadata collection ────────────────────────────────────────────────

  function collectMetadata() {
    const ua = navigator.userAgent;

    let browser = 'Unknown';
    if (ua.includes('Firefox/'))      browser = 'Firefox ' + (ua.match(/Firefox\/(\d+)/)?.[1] || '');
    else if (ua.includes('Edg/'))     browser = 'Edge ' + (ua.match(/Edg\/(\d+)/)?.[1] || '');
    else if (ua.includes('Chrome/'))  browser = 'Chrome ' + (ua.match(/Chrome\/(\d+)/)?.[1] || '');
    else if (ua.includes('Safari/'))  browser = 'Safari ' + (ua.match(/Version\/(\d+)/)?.[1] || '');

    let os = 'Unknown';
    if (ua.includes('Windows'))       os = 'Windows';
    else if (ua.includes('Mac OS'))   os = 'macOS';
    else if (ua.includes('Linux'))    os = 'Linux';
    else if (ua.includes('Android'))  os = 'Android';
    else if (/iPhone|iPad|iPod/.test(ua)) os = 'iOS';

    const isMobile = /Mobi|Android/i.test(ua);
    const isTablet = /Tablet|iPad/i.test(ua) || (isMobile && Math.min(screen.width, screen.height) > 600);
    const device_type = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';

    return {
      browser,
      os,
      device_type,
      viewport:     window.innerWidth + 'x' + window.innerHeight,
      screen:       screen.width + 'x' + screen.height,
      pixel_ratio:  window.devicePixelRatio || 1,
      language:     navigator.language || '',
      timezone:     Intl.DateTimeFormat().resolvedOptions().timeZone || '',
      referrer:     document.referrer || '',
      connection:   navigator.connection?.effectiveType || '',
      touch:        'ontouchstart' in window || navigator.maxTouchPoints > 0,
      url:          window.location.href,
    };
  }

  // ── Config ──────────────────────────────────────────────────────────────

  const script = document.currentScript || document.querySelector('script[data-source][src*="grova"]');
  const API    = script?.getAttribute('data-api-url') || 'https://grova-api-production.up.railway.app/feedback';
  const apiKey = script?.getAttribute('data-key') || null;
  const noBadge = script?.hasAttribute('data-no-badge') || false;
  const SOURCE = script?.dataset.source   || window.location.hostname;
  const SIDE   = script?.dataset.position === 'left' ? 'left' : 'right';

  // ── Fonts ────────────────────────────────────────────────────────────────

  if (!document.querySelector('link[href*="Geist+Mono"]')) {
    const preconnect = document.createElement('link');
    preconnect.rel  = 'preconnect';
    preconnect.href = 'https://fonts.googleapis.com';
    document.head.appendChild(preconnect);

    const fonts = document.createElement('link');
    fonts.rel   = 'stylesheet';
    fonts.href  = 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist+Mono:wght@300;400;500&display=swap';
    fonts.setAttribute('data-grova', '1');
    document.head.appendChild(fonts);
  }

  // ── Chat bubble icon ─────────────────────────────────────────────────────

  const ICON_CHAT = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="flex-shrink:0;margin-top:1px">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
  </svg>`;

  // ── Styles ───────────────────────────────────────────────────────────────

  const style = document.createElement('style');
  style.setAttribute('data-grova', '1');
  style.textContent = `
    /* ── Root + theme tokens ── */
    .gv-root {
      font-family: 'Geist Mono', ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, monospace;
      position: fixed;
      bottom: 24px;
      ${SIDE}: 24px;
      z-index: 99999;
      --gv-bg: #000; --gv-surface: #111; --gv-border: #222; --gv-border2: #2e2e2e;
      --gv-text: #fff; --gv-text2: #c0c0c0; --gv-text3: #606060;
      --gv-shadow: 0 12px 48px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,0.4);
    }
    .gv-root.gv-light {
      --gv-bg: #f8f8f6; --gv-surface: #fff; --gv-border: #d4d4d0; --gv-border2: #c0c0bc;
      --gv-text: #080808; --gv-text2: #333; --gv-text3: #888;
      --gv-shadow: 0 8px 40px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06);
    }

    /* ── Trigger ── */
    .gv-trigger {
      align-items: center;
      background: #00c87a;
      border: none;
      border-radius: 100px;
      box-shadow: 0 4px 20px rgba(0, 200, 122, 0.35);
      color: #000;
      cursor: pointer;
      display: flex;
      font-family: inherit;
      font-size: 0.58rem;
      font-weight: 500;
      gap: 8px;
      letter-spacing: 0.05em;
      padding: 10px 18px;
      text-transform: uppercase;
      transition: opacity 0.15s, box-shadow 0.15s, background 0.15s, color 0.15s;
      white-space: nowrap;
    }
    .gv-trigger:hover {
      box-shadow: 0 6px 28px rgba(0, 200, 122, 0.5);
      opacity: 0.9;
    }
    .gv-trigger-open {
      background: var(--gv-surface);
      box-shadow: var(--gv-shadow);
      color: var(--gv-text2);
    }
    .gv-trigger-open:hover {
      box-shadow: var(--gv-shadow);
      opacity: 1;
      color: var(--gv-text);
    }

    /* ── Mobile backdrop ── */
    .gv-backdrop {
      display: none;
    }
    @media (max-width: 640px) {
      .gv-backdrop {
        background: rgba(0, 0, 0, 0.55);
        bottom: 0;
        display: block;
        left: 0;
        opacity: 0;
        pointer-events: none;
        position: fixed;
        right: 0;
        top: 0;
        transition: opacity 0.22s ease;
        z-index: 99998;
      }
      .gv-backdrop.gv-open {
        opacity: 1;
        pointer-events: all;
      }
    }

    /* ── Panel — desktop ── */
    .gv-panel {
      background: var(--gv-surface);
      border: 1px solid var(--gv-border);
      border-radius: 4px;
      bottom: 52px;
      box-shadow: var(--gv-shadow);
      opacity: 0;
      overflow: hidden;
      pointer-events: none;
      position: absolute;
      ${SIDE}: 0;
      transform: translateY(10px);
      transition: opacity 0.18s ease, transform 0.18s ease;
      width: 340px;
    }
    .gv-panel.gv-open {
      opacity: 1;
      pointer-events: all;
      transform: translateY(0);
    }

    /* ── Panel — mobile bottom sheet ── */
    @media (max-width: 640px) {
      .gv-root {
        bottom: 20px;
        ${SIDE}: 20px;
      }
      .gv-panel {
        border-radius: 14px 14px 0 0;
        border-bottom: none;
        bottom: 0;
        left: 0;
        max-height: 82dvh;
        overflow-y: auto;
        position: fixed;
        right: 0;
        transform: translateY(100%);
        transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
        width: 100%;
        z-index: 99999;
        -webkit-overflow-scrolling: touch;
      }
      .gv-panel.gv-open {
        opacity: 1;
        transform: translateY(0);
      }
      .gv-panel::before {
        background: var(--gv-border2);
        border-radius: 3px;
        content: '';
        display: block;
        height: 4px;
        margin: 12px auto 0;
        width: 36px;
      }
    }

    /* ── Form ── */
    .gv-inner {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 20px;
    }
    @media (max-width: 640px) {
      .gv-inner { padding: 16px 20px 20px; }
    }

    .gv-header {
      align-items: flex-start;
      display: flex;
      justify-content: space-between;
      margin-bottom: 2px;
    }
    .gv-eyebrow {
      color: #00c87a;
      font-size: 0.5rem;
      letter-spacing: 0.16em;
      margin-bottom: 5px;
      text-transform: uppercase;
    }
    .gv-logo {
      align-items: center;
      display: flex;
      gap: 8px;
    }
    .gv-logo-mark {
      background: #00c87a;
      border-radius: 50%;
      flex-shrink: 0;
      height: 10px;
      margin-top: 2px;
      width: 10px;
    }
    .gv-logo-name {
      color: var(--gv-text);
      font-family: 'Instrument Serif', Georgia, 'Times New Roman', serif;
      font-size: 1.15rem;
      font-weight: 400;
      letter-spacing: -0.02em;
      line-height: 1;
    }
    .gv-close {
      background: none;
      border: none;
      color: var(--gv-text3);
      cursor: pointer;
      font-size: 1.1rem;
      line-height: 1;
      padding: 2px 4px;
      transition: color 0.15s;
    }
    .gv-close:hover { color: var(--gv-text); }

    /* ── Type pills ── */
    .gv-types {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }
    .gv-type {
      background: none;
      border: 1px solid var(--gv-border2);
      border-radius: 2px;
      color: var(--gv-text3);
      cursor: pointer;
      font-family: inherit;
      font-size: 0.5rem;
      font-weight: 600;
      letter-spacing: 0.1em;
      padding: 4px 10px;
      text-transform: uppercase;
      transition: border-color 0.15s, color 0.15s, background 0.15s;
    }
    @media (max-width: 640px) {
      .gv-type { font-size: 0.6rem; padding: 6px 12px; }
    }
    .gv-type:hover { border-color: var(--gv-text3); color: var(--gv-text2); }
    .gv-type.gv-t-bug     { background: rgba(255,107,107,0.12); border-color: rgba(255,107,107,0.3); color: #ff6b6b; }
    .gv-type.gv-t-feature { background: rgba(100,160,255,0.10); border-color: rgba(100,160,255,0.3); color: #64a0ff; }
    .gv-type.gv-t-ux      { background: rgba(200,140,255,0.10); border-color: rgba(200,140,255,0.3); color: #c88cff; }
    .gv-type.gv-t-other   { background: rgba(0,200,122,0.10);   border-color: rgba(0,200,122,0.3);  color: #00c87a; }

    /* ── Inputs ── */
    .gv-textarea, .gv-email {
      background: var(--gv-bg);
      border: 1px solid var(--gv-border2);
      border-radius: 4px;
      box-sizing: border-box;
      color: var(--gv-text);
      font-family: inherit;
      font-size: 0.78rem;
      font-weight: 300;
      letter-spacing: 0.04em;
      outline: none;
      padding: 10px 13px;
      transition: border-color 0.15s;
      width: 100%;
    }
    .gv-textarea {
      line-height: 1.65;
      min-height: 90px;
      resize: none;
    }
    @media (max-width: 640px) {
      .gv-textarea { min-height: 110px; font-size: 1rem; }
      .gv-email    { font-size: 1rem; }
    }
    .gv-textarea::placeholder, .gv-email::placeholder { color: var(--gv-text3); }
    .gv-textarea:focus, .gv-email:focus { border-color: #00c87a; }

    /* ── Submit ── */
    .gv-submit {
      background: #00c87a;
      border: none;
      border-radius: 4px;
      box-sizing: border-box;
      color: #000;
      cursor: pointer;
      font-family: inherit;
      font-size: 0.58rem;
      font-weight: 500;
      letter-spacing: 0.05em;
      padding: 12px;
      text-transform: uppercase;
      transition: opacity 0.15s;
      width: 100%;
    }
    @media (max-width: 640px) {
      .gv-submit {
        font-size: 0.75rem;
        padding: 15px;
        margin-bottom: env(safe-area-inset-bottom, 0px);
      }
    }
    .gv-submit:hover:not(:disabled) { opacity: 0.82; }
    .gv-submit:disabled { cursor: not-allowed; opacity: 0.3; }

    /* ── Screenshot checkbox ── */
    .gv-screenshot-label {
      align-items: center; cursor: pointer; display: flex; gap: 8px;
      margin: -4px 0 0;
    }
    .gv-screenshot-check {
      accent-color: #00c87a; cursor: pointer; height: 14px; width: 14px; margin: 0;
    }
    .gv-screenshot-text {
      color: var(--gv-text3); font-size: 0.62rem; letter-spacing: 0.04em;
      transition: color 0.15s;
    }
    .gv-screenshot-label:hover .gv-screenshot-text { color: var(--gv-text2); }

    /* ── Error ── */
    .gv-err { color: #ff6b6b; font-size: 0.66rem; margin: -2px 0 0; }

    /* ── Success ── */
    .gv-success {
      align-items: center;
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 40px 24px;
      text-align: center;
    }
    .gv-success-check {
      align-items: center;
      background: rgba(0, 200, 122, 0.1);
      border: 1px solid rgba(0, 200, 122, 0.28);
      border-radius: 50%;
      color: #00c87a;
      display: flex;
      font-size: 1.1rem;
      height: 44px;
      justify-content: center;
      width: 44px;
    }
    .gv-success-title {
      color: var(--gv-text);
      font-family: 'Instrument Serif', Georgia, serif;
      font-size: 1.3rem;
      font-style: italic;
      font-weight: 400;
      letter-spacing: -0.01em;
      margin: 0;
    }
    .gv-success-sub {
      color: var(--gv-text3);
      font-size: 0.68rem;
      line-height: 1.65;
      margin: 0;
    }
    .gv-success-close {
      background: none;
      border: 1px solid var(--gv-border);
      border-radius: 4px;
      color: var(--gv-text3);
      cursor: pointer;
      font-family: inherit;
      font-size: 0.58rem;
      letter-spacing: 0.08em;
      margin-top: 6px;
      padding: 8px 20px;
      text-transform: uppercase;
      transition: border-color 0.15s, color 0.15s;
    }
    @media (max-width: 640px) {
      .gv-success-close {
        font-size: 0.7rem;
        padding: 12px 28px;
        margin-bottom: env(safe-area-inset-bottom, 0px);
      }
    }
    .gv-success-close:hover { border-color: var(--gv-border2); color: var(--gv-text2); }

    /* ── Footer ── */
    .gv-footer {
      border-top: 1px solid var(--gv-border);
      color: var(--gv-text3);
      font-size: 0.52rem;
      letter-spacing: 0.04em;
      padding: 8px 20px;
      text-align: center;
    }
    .gv-footer a { color: var(--gv-text3); text-decoration: none; transition: color 0.15s; }
    .gv-footer a:hover { color: var(--gv-text2); }
  `;
  document.head.appendChild(style);

  // ── DOM scaffold ─────────────────────────────────────────────────────────

  // Backdrop (mobile only)
  const backdrop = document.createElement('div');
  backdrop.className = 'gv-backdrop';
  document.body.appendChild(backdrop);

  const root    = document.createElement('div');
  root.className = 'gv-root';
  root.id        = 'gv-root';

  const panel   = document.createElement('div');
  panel.className = 'gv-panel';

  const trigger = document.createElement('button');
  trigger.className   = 'gv-trigger';
  trigger.setAttribute('aria-label', 'Send feedback');

  root.appendChild(panel);
  root.appendChild(trigger);
  document.body.appendChild(root);

  // ── State ────────────────────────────────────────────────────────────────

  let isOpen     = false;
  let status     = 'idle'; // idle | sending | success | error
  let activeType = 'bug';

  const TYPES = [
    { value: 'bug',     label: 'Bug'     },
    { value: 'feature', label: 'Feature' },
    { value: 'ux',      label: 'UX'      },
    { value: 'other',   label: 'Other'   },
  ];

  // ── Render helpers ───────────────────────────────────────────────────────

  function renderTrigger() {
    if (isOpen) {
      trigger.innerHTML = `<span style="font-size:1.1rem;line-height:1;margin-right:-1px">×</span><span>Close</span>`;
      trigger.classList.add('gv-trigger-open');
    } else {
      trigger.innerHTML = `${ICON_CHAT}<span>Feedback</span>`;
      trigger.classList.remove('gv-trigger-open');
    }
  }

  function renderPanel() {
    if (status === 'success') {
      panel.innerHTML = `
        <div class="gv-success">
          <div class="gv-success-check">✓</div>
          <p class="gv-success-title">Received.</p>
          <p class="gv-success-sub">We'll look into it.</p>
          <button class="gv-success-close" id="gv-sc">Close</button>
        </div>`;
      document.getElementById('gv-sc').addEventListener('click', close);
      return;
    }

    const typePills = TYPES.map(t => {
      const active = activeType === t.value ? ` gv-t-${t.value}` : '';
      return `<button class="gv-type${active}" data-type="${t.value}">${t.label}</button>`;
    }).join('');

    panel.innerHTML = `
      <div class="gv-inner">
        <div class="gv-header">
          <div>
            <div class="gv-eyebrow">Feedback</div>
            <div class="gv-logo">
              <div class="gv-logo-mark"></div>
              <span class="gv-logo-name">grova</span>
            </div>
          </div>
          <button class="gv-close" id="gv-x" aria-label="Close">×</button>
        </div>
        <div class="gv-types">${typePills}</div>
        <textarea class="gv-textarea" id="gv-msg" placeholder="Describe the issue…" rows="4"></textarea>
        <input class="gv-email" id="gv-email" type="email" placeholder="Email (optional)" />
        <label class="gv-screenshot-label">
          <input type="checkbox" id="gv-screenshot" class="gv-screenshot-check" />
          <span class="gv-screenshot-text">Attach screenshot of this page</span>
        </label>
        ${status === 'error' ? '<p class="gv-err">Something went wrong — try again.</p>' : ''}
        <button class="gv-submit" id="gv-sub" disabled>Send</button>
      </div>
      <div class="gv-footer">Powered by <a href="https://grova.dev" target="_blank" rel="noreferrer">grova.dev</a></div>`;

    panel.querySelectorAll('.gv-type').forEach(btn => {
      btn.addEventListener('click', () => {
        activeType = btn.dataset.type;
        panel.querySelectorAll('.gv-type').forEach(b => { b.className = 'gv-type'; });
        btn.className = `gv-type gv-t-${activeType}`;
      });
    });

    const msgEl = document.getElementById('gv-msg');
    const subEl = document.getElementById('gv-sub');
    msgEl.addEventListener('input', () => { subEl.disabled = !msgEl.value.trim(); });
    subEl.addEventListener('click', submit);
    document.getElementById('gv-x').addEventListener('click', close);
  }

  // ── Actions ──────────────────────────────────────────────────────────────

  async function submit() {
    // ── Throttle: 1 submission per 30 seconds ──
    if (Date.now() - lastSubmitTime < 30000) {
      const existing = panel.querySelector('.gv-err');
      if (!existing) {
        const subEl = document.getElementById('gv-sub');
        if (subEl) {
          const note = document.createElement('p');
          note.className = 'gv-err';
          note.textContent = 'Please wait before submitting again.';
          subEl.parentNode.insertBefore(note, subEl);
        }
      }
      return;
    }

    const msg   = document.getElementById('gv-msg')?.value.trim();
    const email = document.getElementById('gv-email')?.value.trim();
    if (!msg) return;

    const subEl = document.getElementById('gv-sub');
    if (subEl) { subEl.disabled = true; subEl.textContent = 'Sending…'; }

    // Auto-collect metadata and console errors (zero friction)
    const metadata = collectMetadata();
    const console_errors = _grovaErrors.length ? [..._grovaErrors] : null;

    // Screenshot capture (only if checkbox is checked)
    let screenshot = null;
    const screenshotChecked = document.getElementById('gv-screenshot')?.checked;

    if (screenshotChecked) {
      try {
        if (subEl) subEl.textContent = 'Capturing…';

        // Hide widget during capture
        root.style.display = 'none';
        backdrop.style.display = 'none';

        // Lazy-load html2canvas from CDN
        if (!window.html2canvas) {
          await new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            s.onload = resolve;
            s.onerror = () => reject(new Error('Failed to load html2canvas'));
            document.head.appendChild(s);
          });
        }

        const canvas = await window.html2canvas(document.body, {
          scale: 0.5,
          useCORS: true,
          logging: false,
        });

        screenshot = canvas.toDataURL('image/jpeg', 0.6);

        // Restore widget
        root.style.display = '';
        backdrop.style.display = '';
      } catch (err) {
        root.style.display = '';
        backdrop.style.display = '';
        console.warn('[grova] Screenshot capture failed:', err.message);
      }
    }

    if (subEl) subEl.textContent = 'Sending…';

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (apiKey) headers['x-grova-key'] = apiKey;

      const res = await fetch(API, {
        method:  'POST',
        headers,
        body: JSON.stringify({
          type:           activeType,
          message:        msg,
          email:          email || null,
          page:           window.location.pathname,
          timestamp:      new Date().toISOString(),
          source:         SOURCE,
          widget_version: GROVA_WIDGET_VERSION,
          ...(apiKey ? { api_key: apiKey } : {}),
          metadata,
          console_errors,
          screenshot,
        }),
      });
      status = res.ok ? 'success' : 'error';
    } catch {
      status = 'success';
    }

    lastSubmitTime = Date.now();
    renderPanel();
  }

  function open() {
    isOpen = true;
    panel.classList.add('gv-open');
    backdrop.classList.add('gv-open');
    renderTrigger();
    renderPanel();
    requestAnimationFrame(() => document.getElementById('gv-msg')?.focus());
  }

  function close() {
    isOpen = false;
    panel.classList.remove('gv-open');
    backdrop.classList.remove('gv-open');
    renderTrigger();
    setTimeout(() => { status = 'idle'; activeType = 'bug'; }, 280);
  }

  // ── Event listeners ──────────────────────────────────────────────────────

  trigger.addEventListener('click', () => isOpen ? close() : open());
  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen) close(); });
  document.addEventListener('mousedown', e => {
    if (isOpen && !root.contains(e.target) && e.target !== backdrop) close();
  });

  // ── Theme detection ─────────────────────────────────────────────────────

  function applyTheme() {
    const htmlTheme = document.documentElement.getAttribute('data-theme');
    const isLight = htmlTheme === 'light' ||
      (!htmlTheme && window.matchMedia('(prefers-color-scheme: light)').matches);
    root.classList.toggle('gv-light', isLight);
  }

  const themeObserver = new MutationObserver(applyTheme);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', applyTheme);

  // ── Init ─────────────────────────────────────────────────────────────────

  applyTheme();
  renderTrigger();
  window.Grova = { open, close };

})();
