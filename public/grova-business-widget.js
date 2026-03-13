/**
 * Grova Business Widget v2.0
 * Drop-in contact/feedback widget for small business websites.
 * Zero dependencies. Embeds via a single <script> tag.
 *
 * Usage:
 *   <script src="/grova-business-widget.js"
 *     data-source="my-business"
 *     data-business-type="restaurant"
 *     data-name="Hendel's"
 *     data-accent="#e85d0a"
 *     data-position="right">
 *   </script>
 *
 * Config attributes:
 *   data-source         — your business identifier (required)
 *   data-business-type  — restaurant | salon | retail (optional, sets category presets)
 *   data-categories     — comma-separated list to override preset categories
 *   data-name           — your business name, shown in widget header
 *   data-accent         — brand color for the trigger button & active states (default: #00c87a)
 *   data-position       — left | right (default: right)
 *   data-api-url        — override the API endpoint (default: https://grova-api-production.up.railway.app/feedback)
 *   data-key            — your Grova project API key for per-project routing
 *
 * Public API:
 *   window.GrovaContact.open()
 *   window.GrovaContact.close()
 */
(function () {
  'use strict';

  const GROVA_BIZ_WIDGET_VERSION = '2.0.0';

  // ── Guard — prevent double load ────────────────────────────────────────────
  if (window.__grovaContactWidget) return;
  window.__grovaContactWidget = true;

  // ── Throttle state ────────────────────────────────────────────────────
  let lastBizSubmitTime = 0;

  // ── Console error capture (ring buffer of last 10) ─────────────────────

  const _grovaContactErrors = [];
  const MAX_ERRORS_BIZ = 10;

  function pushContactError(entry) {
    if (_grovaContactErrors.length >= MAX_ERRORS_BIZ) _grovaContactErrors.shift();
    _grovaContactErrors.push(entry);
  }

  window.addEventListener('error', (e) => {
    pushContactError({
      message:   e.message || 'Unknown error',
      source:    e.filename || '',
      line:      e.lineno || 0,
      col:       e.colno || 0,
      timestamp: new Date().toISOString(),
    });
  });

  window.addEventListener('unhandledrejection', (e) => {
    pushContactError({
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

  // ── Config ─────────────────────────────────────────────────────────────────
  const script = document.currentScript
              || document.querySelector('script[src*="grova-business-widget"]');
  const API    = script?.getAttribute('data-api-url') || 'https://grova-api-production.up.railway.app/feedback';
  const bizApiKey = script?.getAttribute('data-key') || null;

  const SOURCE      = script?.dataset.source    || window.location.hostname;
  const BIZ_TYPE    = script?.dataset.businessType || 'default';
  const BIZ_NAME    = script?.dataset.name      || '';
  const ACCENT      = script?.dataset.accent    || '#00c87a';
  const SIDE        = script?.dataset.position === 'left' ? 'left' : 'right';
  const CUSTOM_CATS = script?.dataset.categories
    ? script.dataset.categories.split(',').map(s => s.trim()).filter(Boolean)
    : null;

  // ── Category presets ───────────────────────────────────────────────────────
  const PRESETS = {
    restaurant: ['Reservation', 'Complaint', 'Compliment', 'Catering Inquiry', 'General Question'],
    salon:      ['Appointment', 'Complaint', 'Compliment', 'Service Question', 'General Question'],
    retail:     ['Product Question', 'Complaint', 'Return / Exchange', 'Compliment', 'General Question'],
    default:    ['Complaint', 'Compliment', 'Question', 'Suggestion', 'Other'],
  };

  function getCategories() {
    if (CUSTOM_CATS && CUSTOM_CATS.length) return CUSTOM_CATS;
    return PRESETS[BIZ_TYPE] || PRESETS.default;
  }

  // ── Context-aware placeholders ─────────────────────────────────────────────
  const PLACEHOLDERS = {
    'Reservation':       'Date, party size, any special requests…',
    'Complaint':         'Tell us what happened so we can make it right…',
    'Compliment':        "Tell us more.",
    'Catering Inquiry':  'Event date, number of guests, type of occasion…',
    'General Question':  'What would you like to know?',
    'Appointment':       'Preferred date, service, any preferences…',
    'Service Question':  'What would you like to know about our services?',
    'Return / Exchange': 'Order details and reason for the return…',
    'Product Question':  'Which product are you asking about?',
    'Suggestion':        "Describe your idea…",
    'Other':             "What's on your mind?",
  };

  function getPlaceholder(cat) {
    return PLACEHOLDERS[cat] || "Tell us more…";
  }

  // ── Accent colour helpers ──────────────────────────────────────────────────
  function hexToRgb(hex) {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return r ? `${parseInt(r[1],16)}, ${parseInt(r[2],16)}, ${parseInt(r[3],16)}` : '0, 200, 122';
  }

  const ACCENT_RGB = hexToRgb(ACCENT);

  // ── Category colour mapping ──────────────────────────────────────────────
  const CATEGORY_COLORS = {
    'Reservation': '#3b82f6', 'Appointment': '#3b82f6',
    'Complaint': '#ef4444', 'Return / Exchange': '#ef4444',
    'Compliment': '#34d399',
    'Catering Inquiry': '#f59e0b', 'Product Question': '#f59e0b',
    'General Question': '#8b5cf6', 'Service Question': '#8b5cf6',
    'Question': '#8b5cf6',
    'Suggestion': '#06b6d4',
    'Other': '#6b7280',
  };

  function getCategoryColor(cat) {
    return CATEGORY_COLORS[cat] || ACCENT;
  }

  function getCategoryColorRgb(cat) {
    return hexToRgb(getCategoryColor(cat));
  }

  // ── CSS injection ──────────────────────────────────────────────────────────
  if (!document.querySelector('style[data-grova-biz]')) {
    const style = document.createElement('style');
    style.setAttribute('data-grova-biz', '');
    style.textContent = `
      /* ── Grova Business Widget — gb- namespace ── */

      .gb-root {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        position: fixed;
        bottom: 24px;
        ${SIDE}: 24px;
        z-index: 99999;
        --gb-accent: ${ACCENT};
        --gb-accent-rgb: ${ACCENT_RGB};
        --gb-cat-color: ${ACCENT};
        --gb-cat-color-rgb: ${ACCENT_RGB};
        /* Light theme tokens (default for biz widget) */
        --gb-bg: #f5f5f7; --gb-surface: #ffffff; --gb-border: rgba(0,0,0,0.06); --gb-border2: rgba(0,0,0,0.10);
        --gb-text: #1d1d1f; --gb-text2: #48484a; --gb-text3: #8e8e93;
        --gb-shadow: 0 8px 40px rgba(0,0,0,0.08), 0 2px 12px rgba(0,0,0,0.04);
      }
      .gb-root.gb-dark {
        --gb-bg: #1a1a1e; --gb-surface: #242428; --gb-border: rgba(255,255,255,0.08); --gb-border2: rgba(255,255,255,0.12);
        --gb-text: #f5f5f7; --gb-text2: #a1a1aa; --gb-text3: #52525b;
        --gb-shadow: 0 8px 60px rgba(0,0,0,0.5), 0 2px 16px rgba(0,0,0,0.25);
      }

      /* ── Trigger ── */

      .gb-trigger {
        align-items: center;
        background: var(--gb-accent);
        border: none;
        border-radius: 100px;
        box-shadow: 0 4px 20px rgba(var(--gb-accent-rgb), 0.38);
        color: #fff;
        cursor: pointer;
        display: flex;
        font-family: inherit;
        font-size: 0.88rem;
        font-weight: 600;
        gap: 8px;
        padding: 12px 22px;
        transition: opacity 0.15s, box-shadow 0.15s, background 0.15s;
        white-space: nowrap;
      }
      .gb-trigger:hover {
        box-shadow: 0 6px 28px rgba(var(--gb-accent-rgb), 0.55);
        opacity: 0.92;
      }
      .gb-trigger-open {
        background: var(--gb-surface);
        box-shadow: var(--gb-shadow);
        color: var(--gb-text2);
      }
      .gb-trigger-open:hover {
        box-shadow: var(--gb-shadow);
        opacity: 1;
      }
      .gb-trigger svg { flex-shrink: 0; }

      /* ── Backdrop (mobile only) ── */

      .gb-backdrop { display: none; }

      @media (max-width: 640px) {
        .gb-backdrop {
          background: rgba(0,0,0,0.45);
          bottom: 0; display: block; left: 0;
          opacity: 0; pointer-events: none;
          position: fixed; right: 0; top: 0;
          transition: opacity 0.22s ease;
          z-index: 99998;
        }
        .gb-backdrop.gb-open { opacity: 1; pointer-events: all; }
      }

      /* ── Panel — desktop ── */

      .gb-panel {
        background: var(--gb-surface);
        border: 1px solid var(--gb-border);
        border-radius: 20px;
        bottom: 58px;
        box-shadow: var(--gb-shadow);
        opacity: 0;
        overflow: hidden;
        pointer-events: none;
        position: absolute;
        ${SIDE}: 0;
        transform: translateY(10px);
        transition: opacity 0.18s ease, transform 0.18s ease;
        width: 360px;
      }
      .gb-panel.gb-open {
        opacity: 1;
        pointer-events: all;
        transform: translateY(0);
      }

      /* ── Panel — mobile bottom sheet ── */

      @media (max-width: 640px) {
        .gb-root { bottom: 20px; ${SIDE}: 20px; }
        .gb-panel {
          border-bottom: none;
          border-radius: 20px 20px 0 0;
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
        .gb-panel.gb-open { opacity: 1; transform: translateY(0); }
        .gb-panel::before {
          background: var(--gb-border2);
          border-radius: 3px;
          content: '';
          display: block;
          height: 4px;
          margin: 12px auto 0;
          width: 40px;
        }
      }

      /* ── Inner layout ── */

      .gb-inner {
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 20px 22px 16px;
      }

      @media (max-width: 640px) {
        .gb-inner { padding: 16px 20px 20px; gap: 16px; }
      }

      /* ── Header ── */

      .gb-header {
        align-items: flex-start;
        display: flex;
        justify-content: space-between;
      }
      .gb-header-left { display: flex; flex-direction: column; gap: 3px; }
      .gb-eyebrow {
        color: var(--gb-accent);
        font-size: 0.65rem;
        font-weight: 500;
        letter-spacing: 0.1em;
        margin-bottom: 5px;
        text-transform: uppercase;
      }
      .gb-logo {
        align-items: center;
        display: flex;
        gap: 8px;
      }
      .gb-logo-mark {
        background: var(--gb-accent);
        border-radius: 50%;
        flex-shrink: 0;
        height: 12px;
        margin-top: 2px;
        width: 12px;
      }
      .gb-logo-name {
        color: var(--gb-text);
        font-family: 'Instrument Serif', Georgia, serif;
        font-size: 1.45rem;
        font-weight: 400;
        letter-spacing: -0.02em;
        line-height: 1;
      }
      .gb-title {
        color: var(--gb-text);
        font-family: 'Playfair Display', 'New York', Georgia, serif;
        font-size: 1.15rem;
        font-weight: 500;
        line-height: 1.2;
        letter-spacing: -0.02em;
        margin-top: 12px;
      }
      .gb-close {
        align-items: center;
        background: rgba(0,0,0,0.04);
        border: none;
        border-radius: 50%;
        color: var(--gb-text3);
        cursor: pointer;
        display: flex;
        font-size: 1.1rem;
        height: 28px;
        justify-content: center;
        line-height: 1;
        padding: 0;
        transition: background 0.15s, color 0.15s;
        width: 28px;
      }
      .gb-close:hover { background: rgba(0,0,0,0.08); color: var(--gb-text); }
      .gb-root.gb-dark .gb-close { background: rgba(255,255,255,0.06); }
      .gb-root.gb-dark .gb-close:hover { background: rgba(255,255,255,0.12); color: var(--gb-text); }

      /* ── Step navigation ── */

      .gb-back {
        align-items: center;
        background: none;
        border: none;
        color: var(--gb-text3);
        cursor: pointer;
        display: flex;
        font-family: inherit;
        font-size: 0.78rem;
        gap: 5px;
        padding: 0;
        transition: color 0.15s;
      }
      .gb-back:hover { color: var(--gb-text); }

      .gb-breadcrumb {
        align-items: center;
        background: rgba(var(--gb-cat-color-rgb), 0.08);
        border: none;
        border-radius: 999px;
        color: var(--gb-cat-color);
        cursor: pointer;
        display: inline-flex;
        font-family: inherit;
        font-size: 0.75rem;
        font-weight: 500;
        gap: 6px;
        padding: 6px 14px;
        transition: opacity 0.15s;
      }
      .gb-breadcrumb:hover { opacity: 0.75; }

      /* ── Category chips (step 1) ── */

      .gb-cats {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .gb-cat {
        align-items: center;
        background: var(--gb-bg);
        border: 1px solid var(--gb-border2);
        border-radius: 14px;
        color: var(--gb-text);
        cursor: pointer;
        display: flex;
        font-family: inherit;
        font-size: 0.88rem;
        font-weight: 500;
        gap: 12px;
        line-height: 1;
        padding: 15px 16px;
        transition: border-color 0.2s, background 0.2s, transform 0.15s;
      }
      .gb-cat:hover {
        border-color: var(--gb-border2);
        background: var(--gb-bg);
        transform: translateY(-1px);
      }
      .gb-cat:active { transform: translateY(0); }
      .gb-cat-dot {
        border-radius: 50%;
        flex-shrink: 0;
        height: 8px;
        width: 8px;
      }
      .gb-cat-arrow {
        color: var(--gb-text3);
        font-size: 0.85rem;
        margin-left: auto;
        transition: color 0.2s;
      }
      .gb-cat:hover .gb-cat-arrow { color: var(--gb-text2); }

      @media (max-width: 640px) {
        .gb-cat { font-size: 1rem; padding: 17px 18px; }
      }

      /* ── Textarea & email (step 2) ── */

      .gb-textarea,
      .gb-email {
        background: var(--gb-bg);
        border: 1px solid transparent;
        border-radius: 12px;
        box-sizing: border-box;
        color: var(--gb-text);
        font-family: inherit;
        font-size: 0.94rem;
        line-height: 1.65;
        outline: none;
        padding: 12px 14px;
        transition: border-color 0.2s, box-shadow 0.2s;
        width: 100%;
      }
      .gb-textarea {
        min-height: 100px;
        resize: none;
      }
      @media (max-width: 640px) {
        .gb-textarea { min-height: 120px; font-size: 1rem; }
        .gb-email    { font-size: 1rem; }
      }
      .gb-textarea::placeholder,
      .gb-email::placeholder { color: var(--gb-text3); }
      .gb-textarea:focus,
      .gb-email:focus {
        border-color: rgba(var(--gb-cat-color-rgb), 0.25);
        box-shadow: 0 0 0 3px rgba(var(--gb-cat-color-rgb), 0.1);
      }

      /* ── Submit ── */

      .gb-submit {
        background: var(--gb-cat-color);
        border: none;
        border-radius: 999px;
        box-sizing: border-box;
        color: #fff;
        cursor: pointer;
        font-family: inherit;
        font-size: 0.88rem;
        font-weight: 600;
        padding: 14px;
        transition: opacity 0.15s, filter 0.15s, box-shadow 0.15s;
        width: 100%;
      }
      @media (max-width: 640px) {
        .gb-submit {
          font-size: 1rem;
          padding: 16px;
          margin-bottom: env(safe-area-inset-bottom, 0px);
        }
      }
      .gb-submit:hover:not(:disabled) { filter: brightness(1.1); box-shadow: 0 4px 16px rgba(var(--gb-cat-color-rgb), 0.35); }
      .gb-submit:disabled              { cursor: not-allowed; opacity: 0.3; }

      /* ── Screenshot checkbox ── */

      .gb-screenshot-row {
        align-items: center; display: flex; gap: 10px; margin: -4px 0 0;
      }
      .gb-toggle {
        background: var(--gb-bg); border: 1px solid var(--gb-border2); border-radius: 999px;
        cursor: pointer; flex-shrink: 0; height: 24px; position: relative;
        transition: background 0.2s, border-color 0.2s; width: 42px;
      }
      .gb-toggle::after {
        background: #fff; border-radius: 50%; content: ''; height: 18px; left: 2px;
        position: absolute; top: 2px; transition: transform 0.2s cubic-bezier(0.4,0,0.2,1); width: 18px;
      }
      .gb-toggle.gb-toggle-on { background: var(--gb-cat-color); border-color: var(--gb-cat-color); }
      .gb-toggle.gb-toggle-on::after { transform: translateX(18px); }
      .gb-root:not(.gb-dark) .gb-toggle::after { box-shadow: 0 1px 3px rgba(0,0,0,0.15); }
      .gb-screenshot-text {
        color: var(--gb-text3); font-size: 0.72rem; letter-spacing: 0.04em;
        transition: color 0.15s;
      }

      /* ── Error ── */

      .gb-err {
        color: #ff6b6b;
        font-size: 0.78rem;
        margin: -4px 0 0;
      }

      /* ── Success state ── */

      .gb-success {
        align-items: center;
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 44px 28px;
        text-align: center;
      }
      .gb-success-check {
        align-items: center;
        background: rgba(var(--gb-cat-color-rgb), 0.10);
        border: 1.5px solid rgba(var(--gb-cat-color-rgb), 0.25);
        border-radius: 50%;
        color: var(--gb-cat-color);
        display: flex;
        font-size: 1.3rem;
        height: 52px;
        justify-content: center;
        width: 52px;
      }
      .gb-success-title {
        color: var(--gb-text);
        font-family: 'Playfair Display', 'New York', Georgia, serif;
        font-size: 1.5rem;
        font-weight: 500;
        letter-spacing: -0.02em;
        margin: 0;
      }
      .gb-success-sub {
        color: var(--gb-text3);
        font-size: 0.85rem;
        line-height: 1.7;
        margin: 0;
        max-width: 260px;
      }
      .gb-success-close {
        background: none;
        border: 1px solid var(--gb-border2);
        border-radius: 999px;
        color: var(--gb-text3);
        cursor: pointer;
        font-family: inherit;
        font-size: 0.82rem;
        margin-top: 4px;
        padding: 9px 24px;
        transition: border-color 0.15s, color 0.15s;
      }
      .gb-success-close:hover { border-color: var(--gb-text3); color: var(--gb-text); }

      /* ── Footer ── */

      .gb-footer {
        color: var(--gb-text3);
        font-size: 0.6rem;
        letter-spacing: 0.04em;
        opacity: 0.5;
        padding: 8px 22px;
        text-align: center;
      }
      .gb-footer a {
        color: var(--gb-text3);
        font-family: 'Instrument Serif', Georgia, serif;
        font-style: italic;
        text-decoration: none;
        transition: color 0.15s;
      }
      .gb-footer a:hover { color: var(--gb-text2); }

      /* ── Step transitions ── */
      .gb-step-content { animation: gb-fade-in 0.25s ease; }
      @keyframes gb-fade-in {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }

  // ── Google Fonts ───────────────────────────────────────────────────────────
  if (!document.querySelector('link[href*="Playfair+Display"]')) {
    const preconnect = document.createElement('link');
    preconnect.rel  = 'preconnect';
    preconnect.href = 'https://fonts.googleapis.com';
    document.head.appendChild(preconnect);

    const fonts = document.createElement('link');
    fonts.rel  = 'stylesheet';
    fonts.href = 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600&family=Playfair+Display:wght@400;500;600;700&display=swap';
    document.head.appendChild(fonts);
  }

  // ── State ──────────────────────────────────────────────────────────────────
  let isOpen           = false;
  let step             = 1;       // 1 (category) | 2 (message)
  let selectedCategory = null;
  let status           = 'idle';  // idle | sending | success | error
  let autoCloseTimer   = null;

  // ── DOM scaffold ───────────────────────────────────────────────────────────
  const backdrop = document.createElement('div');
  backdrop.className = 'gb-backdrop';
  backdrop.setAttribute('aria-hidden', 'true');
  document.body.appendChild(backdrop);

  const root = document.createElement('div');
  root.className = 'gb-root';
  root.setAttribute('aria-live', 'polite');
  document.body.appendChild(root);

  const panel = document.createElement('div');
  panel.className = 'gb-panel';
  root.appendChild(panel);

  const trigger = document.createElement('button');
  trigger.className = 'gb-trigger';
  trigger.setAttribute('aria-label', 'Contact us');
  root.appendChild(trigger);

  // ── Icons ──────────────────────────────────────────────────────────────────
  const ICON_CHAT = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
  </svg>`;

  // ── Render ─────────────────────────────────────────────────────────────────

  function renderTrigger() {
    if (isOpen) {
      trigger.innerHTML = `<span style="font-size:1.2rem;line-height:1">×</span><span>Close</span>`;
      trigger.classList.add('gb-trigger-open');
    } else {
      trigger.innerHTML = `${ICON_CHAT}<span>Contact${BIZ_NAME ? ' Us' : ' Us'}</span>`;
      trigger.classList.remove('gb-trigger-open');
    }
  }

  function renderPanel() {
    if (status === 'success') {
      renderSuccess();
      return;
    }
    step === 1 ? renderStep1() : renderStep2();
  }

  function renderStep1() {
    const cats = getCategories();
    const title = BIZ_NAME ? `Contact ${BIZ_NAME}` : 'How can we help?';

    // NOTE: innerHTML usage is safe here — all interpolated values (title, category names)
    // are controlled server-side config, not user input. BIZ_NAME comes from the script
    // tag's data-name attribute set by the site owner. Category names come from hardcoded
    // PRESETS or the site owner's data-categories attribute.
    panel.innerHTML = `
      <div class="gb-inner gb-step-content">
        <div class="gb-header">
          <div class="gb-header-left">
            <div class="gb-eyebrow">Feedback</div>
            <div class="gb-logo">
              <div class="gb-logo-mark"></div>
              <span class="gb-logo-name">grova</span>
            </div>
          </div>
          <button class="gb-close" aria-label="Close">×</button>
        </div>
        <div class="gb-title">${title}</div>
        <div class="gb-cats" id="gb-cats">
          ${cats.map(c => {
            const color = getCategoryColor(c);
            return `<button class="gb-cat" data-cat="${c.replace(/"/g, '&quot;')}">
              <span class="gb-cat-dot" style="background:${color}"></span>
              <span>${c}</span>
              <span class="gb-cat-arrow">›</span>
            </button>`;
          }).join('')}
        </div>
      </div>
      <div class="gb-footer">Powered by <a href="https://grova.dev" target="_blank" rel="noreferrer">Grova</a></div>
    `;

    panel.querySelector('.gb-close').onclick = close;
    panel.querySelectorAll('.gb-cat').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedCategory = btn.dataset.cat;
        step = 2;
        // Set dynamic category color
        const catColor = getCategoryColor(selectedCategory);
        const catColorRgb = hexToRgb(catColor);
        root.style.setProperty('--gb-cat-color', catColor);
        root.style.setProperty('--gb-cat-color-rgb', catColorRgb);
        renderPanel();
        requestAnimationFrame(() => {
          const ta = panel.querySelector('.gb-textarea');
          if (ta) ta.focus();
        });
      });
    });
  }

  function renderStep2() {
    const cat = selectedCategory || 'Other';

    // NOTE: innerHTML usage is safe — cat comes from hardcoded PRESETS/owner config,
    // placeholder from PLACEHOLDERS constant. No user-generated content is interpolated.
    panel.innerHTML = `
      <div class="gb-inner gb-step-content">
        <div class="gb-header">
          <div class="gb-header-left">
            <div class="gb-eyebrow">Feedback</div>
            <div class="gb-logo">
              <div class="gb-logo-mark"></div>
              <span class="gb-logo-name">grova</span>
            </div>
          </div>
          <button class="gb-close" aria-label="Close">×</button>
        </div>
        <button class="gb-back" id="gb-back">← Back</button>
        <button class="gb-breadcrumb" id="gb-breadcrumb">${cat} · change</button>
        <textarea
          class="gb-textarea"
          id="gb-msg"
          placeholder="${getPlaceholder(cat)}"
          rows="4"
          required></textarea>
        <input
          class="gb-email"
          id="gb-email"
          type="email"
          placeholder="Your email (optional)" />
        <div class="gb-screenshot-row">
          <div class="gb-toggle gb-toggle-on" id="gb-toggle" role="switch" aria-checked="true" tabindex="0"></div>
          <input type="checkbox" id="gb-screenshot" style="display:none" checked />
          <span class="gb-screenshot-text">Attach screenshot</span>
        </div>
        ${status === 'error' ? `<p class="gb-err">Something went wrong — please try again.</p>` : ''}
        <button class="gb-submit" id="gb-sub" disabled>Send Message</button>
      </div>
      <div class="gb-footer">Powered by <a href="https://grova.dev" target="_blank" rel="noreferrer">Grova</a></div>
    `;

    const msgEl = panel.querySelector('#gb-msg');
    const subEl = panel.querySelector('#gb-sub');

    panel.querySelector('.gb-close').onclick   = close;
    panel.querySelector('#gb-back').onclick    = () => { step = 1; renderPanel(); };
    panel.querySelector('#gb-breadcrumb').onclick = () => { step = 1; renderPanel(); };

    msgEl.addEventListener('input', () => {
      subEl.disabled = !msgEl.value.trim();
    });

    // iOS toggle switch
    const toggleEl = panel.querySelector('#gb-toggle');
    const screenshotInput = panel.querySelector('#gb-screenshot');
    if (toggleEl && screenshotInput) {
      toggleEl.addEventListener('click', function () {
        screenshotInput.checked = !screenshotInput.checked;
        toggleEl.classList.toggle('gb-toggle-on', screenshotInput.checked);
        toggleEl.setAttribute('aria-checked', String(screenshotInput.checked));
      });
      toggleEl.addEventListener('keydown', function (e) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          toggleEl.click();
        }
      });
    }

    subEl.addEventListener('click', handleSubmit);
  }

  function renderSuccess() {
    const name = BIZ_NAME || 'our team';
    panel.innerHTML = `
      <div class="gb-success gb-step-content">
        <div class="gb-success-check">✓</div>
        <p class="gb-success-title">Received.</p>
        <p class="gb-success-sub">Someone from ${name} will follow up.</p>
        <button class="gb-success-close" id="gb-sdone">Done</button>
      </div>
    `;
    panel.querySelector('#gb-sdone').onclick = close;

    // Auto-close after 4 seconds
    clearTimeout(autoCloseTimer);
    autoCloseTimer = setTimeout(close, 4000);
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  async function handleSubmit() {
    // ── Throttle: 1 submission per 30 seconds ──
    if (Date.now() - lastBizSubmitTime < 30000) {
      return;
    }

    const msgEl = panel.querySelector('#gb-msg');
    const subEl = panel.querySelector('#gb-sub');
    const msg   = msgEl?.value.trim();
    const email = panel.querySelector('#gb-email')?.value.trim();

    if (!msg) return;

    status = 'sending';
    subEl.disabled  = true;
    subEl.textContent = 'Sending…';

    // Auto-collect metadata and console errors (zero friction)
    const metadata = collectMetadata();
    const console_errors = _grovaContactErrors.length ? [..._grovaContactErrors] : null;

    // Screenshot capture (only if checkbox is checked)
    let screenshot = null;
    const screenshotChecked = panel.querySelector('#gb-screenshot')?.checked;

    if (screenshotChecked) {
      try {
        subEl.textContent = 'Capturing…';

        // Hide widget during capture
        root.style.display = 'none';
        backdrop.style.display = 'none';

        // Lazy-load modern-screenshot from same origin
        if (!window.modernScreenshot) {
          await new Promise(function (resolve, reject) {
            var s = document.createElement('script');
            s.src = 'https://grova.dev/modern-screenshot.min.js';
            s.onload = resolve;
            s.onerror = function () { reject(new Error('Failed to load screenshot library')); };
            document.head.appendChild(s);
            setTimeout(function () { reject(new Error('Screenshot library load timeout')); }, 5000);
          });
        }

        screenshot = await window.modernScreenshot.domToJpeg(document.documentElement, {
          scale: 0.5,
          quality: 0.6,
          width: window.innerWidth,
          height: window.innerHeight,
        });

        // Restore widget
        root.style.display = '';
        backdrop.style.display = '';
      } catch (err) {
        root.style.display = '';
        backdrop.style.display = '';
        console.warn('[grova] Screenshot capture failed:', err.message);
      }
    }

    subEl.textContent = 'Sending…';

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (bizApiKey) headers['x-grova-key'] = bizApiKey;

      const res = await fetch(API, {
        method:  'POST',
        headers,
        body: JSON.stringify({
          type:      selectedCategory || 'other',
          message:   msg,
          email:     email || null,
          page:      window.location.pathname,
          timestamp: new Date().toISOString(),
          source:    SOURCE,
          mode:      'business',
          widget_version: GROVA_BIZ_WIDGET_VERSION,
          ...(bizApiKey ? { api_key: bizApiKey } : {}),
          metadata,
          console_errors,
          screenshot,
        }),
      });

      lastBizSubmitTime = Date.now();

      if (res.ok) {
        status = 'success';
        renderPanel();
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch {
      status = 'error';
      subEl.disabled    = false;
      subEl.textContent = 'Send Message';
      // Re-render to show error message while preserving textarea value
      const savedMsg   = msgEl?.value || '';
      const savedEmail = panel.querySelector('#gb-email')?.value || '';
      renderStep2();
      const newMsg   = panel.querySelector('#gb-msg');
      const newEmail = panel.querySelector('#gb-email');
      const newSub   = panel.querySelector('#gb-sub');
      if (newMsg)   { newMsg.value = savedMsg; }
      if (newEmail) { newEmail.value = savedEmail; }
      if (newSub)   { newSub.disabled = !savedMsg; }
    }
  }

  // ── Open / close ───────────────────────────────────────────────────────────

  function open() {
    if (isOpen) return;
    isOpen = true;
    status = 'idle';
    step   = 1;
    selectedCategory = null;
    // Reset category color to default accent
    root.style.setProperty('--gb-cat-color', ACCENT);
    root.style.setProperty('--gb-cat-color-rgb', ACCENT_RGB);
    panel.classList.add('gb-open');
    backdrop.classList.add('gb-open');
    renderTrigger();
    renderPanel();
  }

  function close() {
    if (!isOpen) return;
    clearTimeout(autoCloseTimer);
    isOpen = false;
    panel.classList.remove('gb-open');
    backdrop.classList.remove('gb-open');
    renderTrigger();
    // Reset state after animation completes
    setTimeout(() => {
      status           = 'idle';
      step             = 1;
      selectedCategory = null;
      renderPanel();
    }, 300);
  }

  // ── Event listeners ────────────────────────────────────────────────────────

  trigger.addEventListener('click', () => isOpen ? close() : open());
  backdrop.addEventListener('click', close);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) close();
  });

  document.addEventListener('mousedown', e => {
    if (!isOpen) return;
    if (root.contains(e.target) || backdrop.contains(e.target)) return;
    close();
  });

  // ── Theme detection ──────────────────────────────────────────────────────
  function applyTheme() {
    const htmlTheme = document.documentElement.getAttribute('data-theme');
    const isDark = htmlTheme === 'dark' ||
      (!htmlTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.classList.toggle('gb-dark', isDark);
  }

  applyTheme();

  const themeObserver = new MutationObserver(applyTheme);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);

  // ── Init ───────────────────────────────────────────────────────────────────

  renderTrigger();
  renderPanel();

  window.GrovaContact = { open, close };

})();
