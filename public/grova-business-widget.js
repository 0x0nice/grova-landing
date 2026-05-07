/**
 * Grova Business Widget v3.0
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
 *   data-api-url        — override the API endpoint
 *   data-key            — your Grova project API key for per-project routing
 *
 * Public API:
 *   window.GrovaContact.open()
 *   window.GrovaContact.close()
 */
(function () {
  'use strict';

  const GROVA_BIZ_WIDGET_VERSION = '3.0.0';

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

  // ── Category colour mapping (used for the leading dot only — not chrome) ──
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

  // ── CSS injection ──────────────────────────────────────────────────────────
  if (!document.querySelector('style[data-grova-biz]')) {
    const style = document.createElement('style');
    style.setAttribute('data-grova-biz', '');
    style.textContent = `
      /* ── Grova Business Widget v3 — gb- namespace ── */

      .gb-root {
        font-family: 'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-weight: 300;
        position: fixed;
        bottom: 24px;
        ${SIDE}: 24px;
        z-index: 99999;

        --gb-accent: ${ACCENT};
        --gb-accent-rgb: ${ACCENT_RGB};

        /* Motion tokens (mirrors site) */
        --gb-ease: cubic-bezier(0.2, 0.7, 0.2, 1);
        --gb-micro: 180ms;
        --gb-macro: 320ms;

        /* Light theme */
        --gb-bg: #ffffff;
        --gb-bg2: #f8f8f6;
        --gb-surface: #ffffff;
        --gb-border: #d4d4d0;
        --gb-border2: #c0c0bc;
        --gb-text: #080808;
        --gb-text2: #333333;
        --gb-text3: #888888;
        --gb-shadow-panel: 0 12px 40px rgba(0, 0, 0, 0.10), 0 2px 10px rgba(0, 0, 0, 0.04);
        --gb-shadow-trigger: 0 6px 22px rgba(var(--gb-accent-rgb), 0.28);
        --gb-inset-highlight: none;
      }
      .gb-root.gb-dark {
        --gb-bg: #000000;
        --gb-bg2: #0c0c0c;
        --gb-surface: #111111;
        --gb-border: #222222;
        --gb-border2: #2e2e2e;
        --gb-text: #ffffff;
        --gb-text2: #c0c0c0;
        --gb-text3: #606060;
        --gb-shadow-panel: 0 12px 40px rgba(0, 0, 0, 0.6), 0 2px 16px rgba(0, 0, 0, 0.3);
        --gb-shadow-trigger: 0 6px 22px rgba(var(--gb-accent-rgb), 0.42);
        --gb-inset-highlight: inset 0 1px 0 rgba(255, 255, 255, 0.05);
      }

      /* ── Trigger ─────────────────────────────────────────────────────── */

      .gb-trigger {
        align-items: center;
        background: var(--gb-accent);
        border: none;
        border-radius: 4px;
        box-shadow: var(--gb-shadow-trigger), inset 0 1px 0 rgba(255, 255, 255, 0.08);
        color: #000;
        cursor: pointer;
        display: inline-flex;
        font-family: inherit;
        font-size: 0.72rem;
        font-weight: 500;
        gap: 8px;
        letter-spacing: 0.04em;
        padding: 11px 18px;
        text-transform: uppercase;
        transition:
          background var(--gb-micro) var(--gb-ease),
          box-shadow var(--gb-micro) var(--gb-ease),
          transform var(--gb-micro) var(--gb-ease),
          opacity var(--gb-micro) var(--gb-ease);
        white-space: nowrap;
      }
      .gb-trigger:hover {
        opacity: 0.92;
        transform: translateY(-1px);
        box-shadow: 0 10px 28px rgba(var(--gb-accent-rgb), 0.42), inset 0 1px 0 rgba(255, 255, 255, 0.10);
      }
      .gb-trigger:active {
        transform: scale(0.97);
      }
      .gb-trigger-dot {
        width: 6px; height: 6px; border-radius: 50%;
        background: #000;
        opacity: 0.72;
      }
      .gb-trigger-open {
        background: var(--gb-surface);
        color: var(--gb-text2);
        box-shadow: var(--gb-shadow-panel), var(--gb-inset-highlight);
      }
      .gb-trigger-open:hover {
        opacity: 1;
        transform: translateY(-1px);
      }
      .gb-trigger-open .gb-trigger-dot { background: var(--gb-text3); }

      /* ── Backdrop (mobile only) ────────────────────────────────────── */

      .gb-backdrop { display: none; }
      @media (max-width: 640px) {
        .gb-backdrop {
          background: rgba(0, 0, 0, 0.55);
          bottom: 0; display: block; left: 0;
          opacity: 0; pointer-events: none;
          position: fixed; right: 0; top: 0;
          transition: opacity var(--gb-macro) var(--gb-ease);
          z-index: 99998;
        }
        .gb-backdrop.gb-open { opacity: 1; pointer-events: all; }
      }

      /* ── Panel — desktop ──────────────────────────────────────────── */

      .gb-panel {
        background: var(--gb-surface);
        border: 1px solid var(--gb-border);
        border-radius: 12px;
        bottom: 52px;
        box-shadow: var(--gb-shadow-panel), var(--gb-inset-highlight);
        opacity: 0;
        overflow: hidden;
        pointer-events: none;
        position: absolute;
        ${SIDE}: 0;
        transform: translateY(8px) scale(0.98);
        transform-origin: bottom ${SIDE};
        transition:
          opacity var(--gb-macro) var(--gb-ease),
          transform var(--gb-macro) var(--gb-ease);
        width: 360px;
      }
      .gb-panel.gb-open {
        opacity: 1;
        pointer-events: all;
        transform: translateY(0) scale(1);
      }

      /* ── Panel — mobile bottom sheet ──────────────────────────────── */

      @media (max-width: 640px) {
        .gb-root { bottom: 20px; ${SIDE}: 20px; }
        .gb-panel {
          border-radius: 16px 16px 0 0;
          bottom: 0;
          left: 0;
          max-height: 82dvh;
          overflow-y: auto;
          position: fixed;
          right: 0;
          transform: translateY(100%) scale(1);
          transform-origin: bottom center;
          transition: transform var(--gb-macro) var(--gb-ease);
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
          margin: 10px auto 0;
          width: 36px;
        }
      }

      /* ── Inner layout ─────────────────────────────────────────────── */

      .gb-inner {
        display: flex;
        flex-direction: column;
        gap: 18px;
        padding: 24px 24px 18px;
      }
      @media (max-width: 640px) {
        .gb-inner { padding: 18px 22px 22px; gap: 18px; }
      }

      /* ── Header ───────────────────────────────────────────────────── */

      .gb-header {
        align-items: flex-start;
        display: flex;
        justify-content: space-between;
      }
      .gb-header-main {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .gb-eyebrow {
        color: var(--gb-text3);
        font-size: 0.62rem;
        font-weight: 400;
        letter-spacing: 0.22em;
        text-transform: uppercase;
      }
      .gb-wordmark {
        color: var(--gb-text);
        font-family: 'Instrument Serif', Georgia, serif;
        font-size: 1.6rem;
        font-style: italic;
        font-weight: 400;
        letter-spacing: -0.02em;
        line-height: 1.1;
      }
      .gb-wordmark em {
        color: var(--gb-text2);
        font-style: italic;
      }
      .gb-close {
        align-items: center;
        background: transparent;
        border: 1px solid var(--gb-border);
        border-radius: 50%;
        color: var(--gb-text3);
        cursor: pointer;
        display: flex;
        font-size: 1rem;
        height: 28px;
        justify-content: center;
        line-height: 1;
        padding: 0;
        transition: border-color var(--gb-micro) var(--gb-ease), color var(--gb-micro) var(--gb-ease);
        width: 28px;
      }
      .gb-close:hover {
        border-color: var(--gb-border2);
        color: var(--gb-text);
      }

      /* ── Categories (step 1) ──────────────────────────────────────── */

      .gb-cats {
        display: flex;
        flex-direction: column;
        border-top: 1px solid var(--gb-border);
      }
      .gb-cat {
        align-items: center;
        background: transparent;
        border: none;
        border-bottom: 1px solid var(--gb-border);
        color: var(--gb-text);
        cursor: pointer;
        display: flex;
        font-family: inherit;
        font-size: 0.84rem;
        font-weight: 400;
        gap: 14px;
        line-height: 1;
        padding: 15px 2px;
        text-align: left;
        transition: color var(--gb-micro) var(--gb-ease), background var(--gb-micro) var(--gb-ease), padding var(--gb-micro) var(--gb-ease);
      }
      .gb-cat:hover {
        background: var(--gb-bg2);
        padding-left: 10px;
        padding-right: 10px;
      }
      .gb-cat:active { opacity: 0.7; }
      .gb-cat-dot {
        border-radius: 50%;
        flex-shrink: 0;
        height: 6px;
        width: 6px;
      }
      .gb-cat-arrow {
        color: var(--gb-text3);
        font-family: inherit;
        font-size: 0.88rem;
        margin-left: auto;
        transition: color var(--gb-micro) var(--gb-ease), transform var(--gb-micro) var(--gb-ease);
      }
      .gb-cat:hover .gb-cat-arrow {
        color: var(--gb-text);
        transform: translateX(2px);
      }

      @media (max-width: 640px) {
        .gb-cat { font-size: 0.96rem; padding: 18px 2px; }
      }

      /* ── Step 2 ───────────────────────────────────────────────────── */

      .gb-breadcrumb {
        align-items: center;
        background: transparent;
        border: none;
        color: var(--gb-text3);
        cursor: pointer;
        display: inline-flex;
        font-family: inherit;
        font-size: 0.7rem;
        gap: 8px;
        letter-spacing: 0.14em;
        padding: 0;
        text-transform: uppercase;
        transition: color var(--gb-micro) var(--gb-ease);
      }
      .gb-breadcrumb:hover { color: var(--gb-text); }
      .gb-breadcrumb-chev { opacity: 0.6; }
      .gb-breadcrumb-cat {
        align-items: center;
        display: inline-flex;
        gap: 7px;
        color: var(--gb-text2);
      }
      .gb-breadcrumb-dot {
        width: 5px; height: 5px; border-radius: 50%;
      }

      .gb-field {
        border-bottom: 1px solid var(--gb-border);
        padding-bottom: 10px;
      }
      .gb-field:focus-within {
        border-bottom-color: var(--gb-text);
      }

      .gb-textarea {
        background: transparent;
        border: none;
        box-sizing: border-box;
        color: var(--gb-text);
        font-family: inherit;
        font-size: 0.88rem;
        font-weight: 300;
        line-height: 1.65;
        min-height: 108px;
        outline: none;
        padding: 4px 0;
        resize: none;
        width: 100%;
      }
      .gb-textarea::placeholder { color: var(--gb-text3); }

      .gb-email {
        background: transparent;
        border: none;
        box-sizing: border-box;
        color: var(--gb-text);
        font-family: inherit;
        font-size: 0.82rem;
        font-weight: 300;
        outline: none;
        padding: 4px 0;
        width: 100%;
      }
      .gb-email::placeholder { color: var(--gb-text3); }

      @media (max-width: 640px) {
        .gb-textarea { min-height: 130px; font-size: 1rem; }
        .gb-email    { font-size: 0.95rem; }
      }

      /* ── Screenshot toggle (quieter) ──────────────────────────────── */

      .gb-screenshot-row {
        align-items: center;
        color: var(--gb-text3);
        display: flex;
        font-size: 0.66rem;
        gap: 10px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }
      .gb-toggle {
        background: var(--gb-bg2);
        border: 1px solid var(--gb-border);
        border-radius: 999px;
        cursor: pointer;
        flex-shrink: 0;
        height: 20px;
        position: relative;
        transition: background var(--gb-micro) var(--gb-ease), border-color var(--gb-micro) var(--gb-ease);
        width: 34px;
      }
      .gb-toggle::after {
        background: var(--gb-text3);
        border-radius: 50%;
        content: '';
        height: 12px;
        left: 3px;
        position: absolute;
        top: 3px;
        transition: transform var(--gb-micro) var(--gb-ease), background var(--gb-micro) var(--gb-ease);
        width: 12px;
      }
      .gb-toggle.gb-toggle-on {
        background: var(--gb-accent);
        border-color: var(--gb-accent);
      }
      .gb-toggle.gb-toggle-on::after {
        background: #000;
        transform: translateX(14px);
      }

      /* ── Submit ───────────────────────────────────────────────────── */

      .gb-submit {
        align-items: center;
        background: var(--gb-accent);
        border: none;
        border-radius: 4px;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
        box-sizing: border-box;
        color: #000;
        cursor: pointer;
        display: inline-flex;
        font-family: inherit;
        font-size: 0.74rem;
        font-weight: 500;
        gap: 10px;
        justify-content: center;
        letter-spacing: 0.04em;
        padding: 13px 16px;
        text-transform: uppercase;
        transition:
          opacity var(--gb-micro) var(--gb-ease),
          transform var(--gb-micro) var(--gb-ease),
          box-shadow var(--gb-micro) var(--gb-ease);
        width: 100%;
      }
      .gb-submit:hover:not(:disabled) {
        opacity: 0.92;
        transform: translateY(-1px);
        box-shadow: 0 6px 18px rgba(var(--gb-accent-rgb), 0.32), inset 0 1px 0 rgba(255, 255, 255, 0.1);
      }
      .gb-submit:active:not(:disabled) {
        transform: scale(0.98);
      }
      .gb-submit:disabled {
        cursor: not-allowed;
        opacity: 0.3;
      }
      .gb-submit-spinner {
        animation: gb-spin 0.8s linear infinite;
        height: 14px;
        width: 14px;
      }
      @keyframes gb-spin {
        to { transform: rotate(360deg); }
      }

      /* ── Error ────────────────────────────────────────────────────── */

      .gb-err {
        color: #ff6b6b;
        font-size: 0.72rem;
        font-weight: 400;
        line-height: 1.5;
        margin: 0;
      }

      /* ── Success ──────────────────────────────────────────────────── */

      .gb-success {
        align-items: center;
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 56px 28px 44px;
        text-align: center;
      }
      .gb-success-dot {
        animation: gb-pulse 2.4s ease-in-out infinite;
        background: var(--gb-accent);
        border-radius: 50%;
        height: 10px;
        width: 10px;
      }
      @keyframes gb-pulse {
        0%, 100% { opacity: 0.6; transform: scale(1); }
        50%      { opacity: 1;   transform: scale(1.18); }
      }
      .gb-success-title {
        color: var(--gb-text);
        font-family: 'Instrument Serif', Georgia, serif;
        font-size: 1.9rem;
        font-style: italic;
        font-weight: 400;
        letter-spacing: -0.02em;
        line-height: 1.1;
        margin: 0;
      }
      .gb-success-sub {
        color: var(--gb-text3);
        font-size: 0.76rem;
        font-weight: 300;
        letter-spacing: 0.02em;
        line-height: 1.6;
        margin: 0;
        max-width: 260px;
      }

      /* ── Footer ───────────────────────────────────────────────────── */

      .gb-footer {
        align-items: center;
        border-top: 1px solid var(--gb-border);
        color: var(--gb-text3);
        display: flex;
        font-size: 0.58rem;
        gap: 6px;
        justify-content: center;
        letter-spacing: 0.22em;
        padding: 10px 24px 14px;
        text-transform: uppercase;
      }
      .gb-footer a {
        color: var(--gb-text3);
        font-family: 'Instrument Serif', Georgia, serif;
        font-size: 0.82rem;
        font-style: italic;
        letter-spacing: -0.01em;
        text-decoration: none;
        text-transform: none;
        transition: color var(--gb-micro) var(--gb-ease);
      }
      .gb-footer a:hover { color: var(--gb-text); }

      /* ── Step fade ─────────────────────────────────────────────────── */

      .gb-step-content { animation: gb-fade-in var(--gb-macro) var(--gb-ease); }
      @keyframes gb-fade-in {
        from { opacity: 0; transform: translateY(6px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      /* ── Reduced motion ────────────────────────────────────────────── */

      @media (prefers-reduced-motion: reduce) {
        .gb-root *,
        .gb-root *::before,
        .gb-root *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // ── Fonts: Instrument Serif + Geist Mono (matches Grova site) ─────────────
  if (!document.querySelector('link[href*="Instrument+Serif"]')) {
    const preconnect = document.createElement('link');
    preconnect.rel  = 'preconnect';
    preconnect.href = 'https://fonts.googleapis.com';
    document.head.appendChild(preconnect);

    const preconnectGstatic = document.createElement('link');
    preconnectGstatic.rel  = 'preconnect';
    preconnectGstatic.href = 'https://fonts.gstatic.com';
    preconnectGstatic.crossOrigin = 'anonymous';
    document.head.appendChild(preconnectGstatic);

    const fonts = document.createElement('link');
    fonts.rel  = 'stylesheet';
    fonts.href = 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist+Mono:wght@300;400;500&display=swap';
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
  trigger.setAttribute('aria-label', 'Feedback');
  root.appendChild(trigger);

  // ── Render ─────────────────────────────────────────────────────────────────

  function renderTrigger() {
    if (isOpen) {
      trigger.innerHTML = `<span class="gb-trigger-dot" aria-hidden="true"></span><span>Close</span>`;
      trigger.classList.add('gb-trigger-open');
    } else {
      trigger.innerHTML = `<span class="gb-trigger-dot" aria-hidden="true"></span><span>Feedback</span>`;
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
    const wordmark = BIZ_NAME
      ? `${BIZ_NAME},<br/><em>listening.</em>`
      : `Feedback,<br/><em>considered.</em>`;

    // NOTE: innerHTML usage is safe — interpolated values come from controlled config
    // (BIZ_NAME from site-owner's script tag, category names from PRESETS or owner config).
    panel.innerHTML = `
      <div class="gb-inner gb-step-content">
        <div class="gb-header">
          <div class="gb-header-main">
            <span class="gb-eyebrow">Feedback</span>
            <span class="gb-wordmark">${wordmark}</span>
          </div>
          <button class="gb-close" aria-label="Close">×</button>
        </div>
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
    const catColor = getCategoryColor(cat);
    const wordmark = BIZ_NAME
      ? `Talk to<br/><em>${BIZ_NAME}.</em>`
      : `Talk to us,<br/><em>plainly.</em>`;

    // NOTE: innerHTML usage is safe — cat comes from hardcoded PRESETS/owner config,
    // placeholder from PLACEHOLDERS constant. No user-generated content is interpolated.
    panel.innerHTML = `
      <div class="gb-inner gb-step-content">
        <div class="gb-header">
          <div class="gb-header-main">
            <span class="gb-eyebrow">Feedback</span>
            <span class="gb-wordmark">${wordmark}</span>
          </div>
          <button class="gb-close" aria-label="Close">×</button>
        </div>
        <button class="gb-breadcrumb" id="gb-breadcrumb" aria-label="Change category">
          <span class="gb-breadcrumb-chev">←</span>
          <span class="gb-breadcrumb-cat">
            <span class="gb-breadcrumb-dot" style="background:${catColor}"></span>
            ${cat}
          </span>
        </button>
        <div class="gb-field">
          <textarea
            class="gb-textarea"
            id="gb-msg"
            placeholder="${getPlaceholder(cat)}"
            rows="4"
            required
          ></textarea>
        </div>
        <div class="gb-field">
          <input
            class="gb-email"
            id="gb-email"
            type="email"
            placeholder="Your email (optional)"
          />
        </div>
        <div class="gb-screenshot-row">
          <div class="gb-toggle gb-toggle-on" id="gb-toggle" role="switch" aria-checked="true" tabindex="0"></div>
          <input type="checkbox" id="gb-screenshot" style="display:none" checked />
          <span>Attach screenshot</span>
        </div>
        ${status === 'error' ? `<p class="gb-err">Something went wrong — please try again.</p>` : ''}
        <button class="gb-submit" id="gb-sub" disabled>
          <span id="gb-sub-label">Send</span>
        </button>
      </div>
      <div class="gb-footer">Powered by <a href="https://grova.dev" target="_blank" rel="noreferrer">Grova</a></div>
    `;

    const msgEl = panel.querySelector('#gb-msg');
    const subEl = panel.querySelector('#gb-sub');

    panel.querySelector('.gb-close').onclick   = close;
    panel.querySelector('#gb-breadcrumb').onclick = () => { step = 1; renderPanel(); };

    msgEl.addEventListener('input', () => {
      subEl.disabled = !msgEl.value.trim();
    });

    // Toggle switch
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
        <div class="gb-success-dot" aria-hidden="true"></div>
        <p class="gb-success-title">Thank you.</p>
        <p class="gb-success-sub">Someone from ${name} will follow up shortly.</p>
      </div>
    `;
    clearTimeout(autoCloseTimer);
    autoCloseTimer = setTimeout(close, 3200);
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
    subEl.disabled = true;

    // Replace label with spinner
    subEl.innerHTML = `
      <svg class="gb-submit-spinner" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.5" stroke-dasharray="45" stroke-linecap="round" />
      </svg>
    `;

    // Auto-collect metadata and console errors (zero friction)
    const metadata = collectMetadata();
    const console_errors = _grovaContactErrors.length ? [..._grovaContactErrors] : null;

    // Screenshot capture (only if checkbox is checked)
    let screenshot = null;
    const screenshotChecked = panel.querySelector('#gb-screenshot')?.checked;

    if (screenshotChecked) {
      try {
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
    }, 320);
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
