/*!
 * Grova Widget v1.2
 * https://grova.dev
 *
 * Drop-in feedback widget for any web app.
 * Now with voice recording support.
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

  const GROVA_WIDGET_VERSION = '1.2.0';

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
  const TRANSCRIBE_URL = API.replace(/\/feedback\/?$/, '/feedback/transcribe');

  // ── Fonts ────────────────────────────────────────────────────────────────

  if (!document.querySelector('link[href*="Inter"]')) {
    const preconnect = document.createElement('link');
    preconnect.rel  = 'preconnect';
    preconnect.href = 'https://fonts.googleapis.com';
    document.head.appendChild(preconnect);

    const fonts = document.createElement('link');
    fonts.rel   = 'stylesheet';
    fonts.href  = 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500;600&display=swap';
    fonts.setAttribute('data-grova', '1');
    document.head.appendChild(fonts);
  }

  // ── Icons ─────────────────────────────────────────────────────────────────

  const ICON_CHAT = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="flex-shrink:0;margin-top:1px"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>';

  const ICON_MIC = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>';

  // ── Styles ───────────────────────────────────────────────────────────────

  const style = document.createElement('style');
  style.setAttribute('data-grova', '1');
  style.textContent = [
    // ── Design system ──
    '.gv-root{font-family:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;position:fixed;bottom:24px;' + SIDE + ':24px;z-index:99999;--gv-bg:#1a1a1e;--gv-surface:#242428;--gv-border:rgba(255,255,255,0.08);--gv-border2:rgba(255,255,255,0.12);--gv-text:#f5f5f7;--gv-text2:#a1a1aa;--gv-text3:#52525b;--gv-green:#00c87a;--gv-shadow:0 8px 60px rgba(0,0,0,0.5),0 2px 16px rgba(0,0,0,0.25)}',
    '.gv-root.gv-light{--gv-bg:#f4f4f5;--gv-surface:#ffffff;--gv-border:rgba(0,0,0,0.06);--gv-border2:rgba(0,0,0,0.10);--gv-text:#18181b;--gv-text2:#3f3f46;--gv-text3:#a1a1aa;--gv-green:#00b36b;--gv-shadow:0 8px 40px rgba(0,0,0,0.08),0 2px 12px rgba(0,0,0,0.04)}',
    // ── Trigger ──
    '.gv-trigger{align-items:center;background:var(--gv-green);border:none;border-radius:999px;box-shadow:0 4px 24px rgba(0,200,122,0.3);color:#000;cursor:pointer;display:flex;font-family:inherit;font-size:0.72rem;font-weight:500;gap:8px;letter-spacing:0.04em;padding:12px 20px;text-transform:uppercase;transition:opacity 0.15s,box-shadow 0.15s,background 0.15s,color 0.15s;white-space:nowrap}',
    '.gv-trigger:hover{box-shadow:0 6px 28px rgba(0,200,122,0.5);opacity:0.9}',
    '.gv-trigger-open{background:var(--gv-surface);box-shadow:var(--gv-shadow);color:var(--gv-text2)}',
    '.gv-trigger-open:hover{box-shadow:var(--gv-shadow);opacity:1;color:var(--gv-text)}',
    // ── Backdrop ──
    '.gv-backdrop{display:none}',
    '@media(max-width:640px){.gv-backdrop{background:rgba(0,0,0,0.55);bottom:0;display:block;left:0;opacity:0;pointer-events:none;position:fixed;right:0;top:0;transition:opacity 0.22s ease;z-index:99998}.gv-backdrop.gv-open{opacity:1;pointer-events:all}}',
    // ── Panel ──
    '.gv-panel{background:var(--gv-surface);border:1px solid var(--gv-border);border-radius:20px;bottom:52px;box-shadow:var(--gv-shadow);opacity:0;overflow:hidden;pointer-events:none;position:absolute;' + SIDE + ':0;transform:translateY(10px);transition:opacity 0.18s ease,transform 0.18s ease;width:360px}',
    '.gv-panel.gv-open{opacity:1;pointer-events:all;transform:translateY(0)}',
    '@media(max-width:640px){.gv-root{bottom:20px;' + SIDE + ':20px}.gv-panel{border-radius:20px 20px 0 0;border-bottom:none;bottom:0;left:0;max-height:82dvh;overflow-y:auto;position:fixed;right:0;transform:translateY(100%);transition:transform 0.28s cubic-bezier(0.4,0,0.2,1);width:100%;z-index:99999;-webkit-overflow-scrolling:touch}.gv-panel.gv-open{opacity:1;transform:translateY(0)}.gv-panel::before{background:var(--gv-border2);border-radius:3px;content:"";display:block;height:4px;margin:12px auto 0;width:36px}}',
    // ── Inner ──
    '.gv-inner{display:flex;flex-direction:column;gap:16px;padding:24px}',
    '@media(max-width:640px){.gv-inner{padding:16px 20px 20px}}',
    // ── Header ──
    '.gv-header{align-items:flex-start;display:flex;justify-content:space-between;margin-bottom:0}',
    '.gv-eyebrow{color:var(--gv-green);font-size:0.65rem;font-weight:500;letter-spacing:0.1em;margin-bottom:5px;text-transform:uppercase}',
    '.gv-logo{align-items:center;display:flex;gap:8px}',
    '.gv-logo-mark{background:var(--gv-green);border-radius:50%;flex-shrink:0;height:12px;margin-top:2px;width:12px}',
    '.gv-logo-name{color:var(--gv-text);font-family:"Instrument Serif",Georgia,"Times New Roman",serif;font-size:1.45rem;font-weight:400;letter-spacing:-0.02em;line-height:1}',
    // ── Close button (circular) ──
    '.gv-close{align-items:center;background:rgba(255,255,255,0.06);border:none;border-radius:50%;color:var(--gv-text3);cursor:pointer;display:flex;font-size:0.9rem;height:28px;justify-content:center;line-height:1;transition:background 0.15s,color 0.15s;width:28px}',
    '.gv-close:hover{background:rgba(255,255,255,0.12);color:var(--gv-text)}',
    '.gv-light .gv-close{background:rgba(0,0,0,0.04)}',
    '.gv-light .gv-close:hover{background:rgba(0,0,0,0.08)}',
    // ── Segmented control ──
    '.gv-seg{background:var(--gv-bg);border-radius:12px;display:flex;gap:2px;padding:3px;position:relative}',
    '.gv-seg-btn{background:none;border:none;border-radius:10px;color:var(--gv-text3);cursor:pointer;flex:1;font-family:inherit;font-size:0.75rem;font-weight:500;letter-spacing:0.02em;padding:8px 0;position:relative;transition:color 0.2s;z-index:1}',
    '.gv-seg-btn:hover{color:var(--gv-text2)}',
    '.gv-seg-btn.gv-seg-active{color:var(--gv-text)}',
    '.gv-seg-indicator{background:var(--gv-surface);border:1px solid var(--gv-border2);border-radius:10px;bottom:3px;box-shadow:0 1px 3px rgba(0,0,0,0.2);left:0;position:absolute;top:3px;transition:left 0.25s cubic-bezier(0.4,0,0.2,1),width 0.25s cubic-bezier(0.4,0,0.2,1);z-index:0}',
    // ── Inputs ──
    '.gv-textarea,.gv-email{background:var(--gv-bg);border:1px solid var(--gv-border);border-radius:12px;box-sizing:border-box;color:var(--gv-text);font-family:inherit;font-size:0.85rem;font-weight:400;letter-spacing:0.01em;line-height:1.6;outline:none;padding:12px 16px;transition:border-color 0.2s,box-shadow 0.2s;width:100%}',
    '.gv-textarea{min-height:100px;resize:none}',
    '@media(max-width:640px){.gv-textarea{min-height:110px;font-size:1rem}.gv-email{font-size:1rem}}',
    '.gv-textarea::placeholder,.gv-email::placeholder{color:var(--gv-text3)}',
    '.gv-textarea:focus,.gv-email:focus{border-color:var(--gv-green);box-shadow:0 0 0 3px rgba(0,200,122,0.15)}',
    // ── Textarea wrap + mic FAB ──
    '.gv-textarea-wrap{position:relative}',
    '.gv-mic{align-items:center;background:var(--gv-green);border:none;border-radius:50%;bottom:10px;box-shadow:0 2px 12px rgba(0,200,122,0.35);color:#000;cursor:pointer;display:flex;height:36px;justify-content:center;position:absolute;right:10px;transition:box-shadow 0.2s,transform 0.15s;width:36px;z-index:1}',
    '.gv-mic:hover{box-shadow:0 4px 20px rgba(0,200,122,0.5);transform:scale(1.05)}',
    '.gv-mic svg{width:16px;height:16px}',
    // ── Submit ──
    '.gv-submit{background:var(--gv-green);border:none;border-radius:999px;box-sizing:border-box;color:#000;cursor:pointer;font-family:inherit;font-size:0.8rem;font-weight:600;letter-spacing:0.03em;padding:14px;transition:box-shadow 0.2s,filter 0.15s;width:100%}',
    '@media(max-width:640px){.gv-submit{font-size:0.9rem;padding:16px;margin-bottom:env(safe-area-inset-bottom,0px)}}',
    '.gv-submit:hover:not(:disabled){filter:brightness(1.1);box-shadow:0 4px 24px rgba(0,200,122,0.4)}',
    '.gv-submit:disabled{cursor:not-allowed;opacity:0.35;filter:none;box-shadow:none}',
    // ── Screenshot toggle ──
    '.gv-screenshot-row{align-items:center;display:flex;gap:12px}',
    '.gv-toggle{background:var(--gv-bg);border:1px solid var(--gv-border2);border-radius:999px;cursor:pointer;flex-shrink:0;height:24px;position:relative;transition:background 0.2s,border-color 0.2s;width:42px}',
    '.gv-toggle::after{background:#fff;border-radius:50%;content:"";height:18px;left:2px;position:absolute;top:2px;transition:transform 0.2s cubic-bezier(0.4,0,0.2,1);width:18px}',
    '.gv-toggle.gv-toggle-on{background:var(--gv-green);border-color:var(--gv-green)}',
    '.gv-toggle.gv-toggle-on::after{transform:translateX(18px)}',
    '.gv-screenshot-text{color:var(--gv-text3);font-size:0.78rem;transition:color 0.15s}',
    // ── Error ──
    '.gv-err{color:#ff6b6b;font-size:0.75rem;border-radius:8px;margin:-2px 0 0}',
    // ── Recording ──
    '.gv-recording{background:var(--gv-bg);border:1px solid var(--gv-border2);border-radius:12px;display:flex;flex-direction:column;gap:12px;padding:16px}',
    '.gv-rec-header{align-items:center;display:flex;gap:8px}',
    '.gv-rec-dot{animation:gv-pulse 1.4s ease-in-out infinite;background:#ff4444;border-radius:50%;flex-shrink:0;height:8px;width:8px}',
    '@keyframes gv-pulse{0%,100%{opacity:1}50%{opacity:0.3}}',
    '.gv-rec-label{color:#ff4444;font-size:0.7rem;font-weight:500;letter-spacing:0.08em;text-transform:uppercase}',
    '.gv-rec-time{color:var(--gv-text2);font-size:0.8rem;font-variant-numeric:tabular-nums;margin-left:auto}',
    '.gv-waveform{height:48px;width:100%}',
    '.gv-rec-actions{display:flex;gap:8px;justify-content:center}',
    '.gv-rec-btn{background:none;border:1px solid var(--gv-border2);border-radius:999px;color:var(--gv-text3);cursor:pointer;font-family:inherit;font-size:0.7rem;font-weight:500;letter-spacing:0.04em;padding:8px 20px;text-transform:uppercase;transition:border-color 0.15s,color 0.15s,background 0.15s}',
    '.gv-rec-btn:hover{border-color:var(--gv-text3);color:var(--gv-text2)}',
    '.gv-rec-stop{background:#ff4444;border-color:#ff4444;color:#fff}',
    '.gv-rec-stop:hover{background:#cc3333;border-color:#cc3333;color:#fff}',
    // ── Transcribing ──
    '.gv-transcribing{align-items:center;background:var(--gv-bg);border:1px solid var(--gv-border2);border-radius:12px;display:flex;flex-direction:column;gap:10px;padding:24px 16px}',
    '.gv-transcribing-spinner{animation:gv-spin 1s linear infinite;border:2px solid var(--gv-border2);border-radius:50%;border-top-color:var(--gv-green);height:24px;width:24px}',
    '@keyframes gv-spin{to{transform:rotate(360deg)}}',
    '.gv-transcribing-text{color:var(--gv-text3);font-size:0.72rem;letter-spacing:0.04em;text-transform:uppercase}',
    // ── Voice review ──
    '.gv-voice-label{align-items:center;display:flex;gap:6px;justify-content:space-between}',
    '.gv-voice-tag{color:var(--gv-text3);font-size:0.68rem;letter-spacing:0.06em;text-transform:uppercase}',
    '.gv-rerecord{background:none;border:none;color:var(--gv-text3);cursor:pointer;font-family:inherit;font-size:0.68rem;letter-spacing:0.04em;padding:2px 0;text-decoration:none;transition:color 0.15s}',
    '.gv-rerecord:hover{color:var(--gv-text2)}',
    '.gv-voice-err{color:#ff6b6b;font-size:0.72rem;line-height:1.5;margin:-4px 0}',
    // ── Success ──
    '.gv-success{align-items:center;display:flex;flex-direction:column;gap:10px;padding:40px 24px;text-align:center}',
    '.gv-success-check{align-items:center;background:rgba(0,200,122,0.1);border:1px solid rgba(0,200,122,0.28);border-radius:50%;color:var(--gv-green);display:flex;font-size:1.1rem;height:44px;justify-content:center;width:44px}',
    '.gv-success-title{color:var(--gv-text);font-family:"Instrument Serif",Georgia,serif;font-size:1.3rem;font-style:italic;font-weight:400;letter-spacing:-0.01em;margin:0}',
    '.gv-success-sub{color:var(--gv-text3);font-size:0.78rem;line-height:1.65;margin:0}',
    '.gv-success-close{background:none;border:1px solid var(--gv-border);border-radius:999px;color:var(--gv-text3);cursor:pointer;font-family:inherit;font-size:0.72rem;letter-spacing:0.04em;margin-top:6px;padding:10px 24px;transition:border-color 0.15s,color 0.15s}',
    '@media(max-width:640px){.gv-success-close{font-size:0.8rem;padding:12px 28px;margin-bottom:env(safe-area-inset-bottom,0px)}}',
    '.gv-success-close:hover{border-color:var(--gv-border2);color:var(--gv-text2)}',
    // ── Footer ──
    '.gv-footer{color:var(--gv-text3);font-size:0.68rem;letter-spacing:0.02em;opacity:0.5;padding:12px 24px;text-align:center}',
    '.gv-footer a{color:var(--gv-text3);text-decoration:none;transition:color 0.15s}',
    '.gv-footer a:hover{color:var(--gv-text2)}',
  ].join('\n');
  document.head.appendChild(style);

  // ── DOM scaffold ─────────────────────────────────────────────────────────

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
  let status     = 'idle';
  let activeType = 'bug';

  const TYPES = [
    { value: 'bug',     label: 'Bug'     },
    { value: 'feature', label: 'Feature' },
    { value: 'ux',      label: 'UX'      },
    { value: 'other',   label: 'Other'   },
  ];

  // ── Voice state ──────────────────────────────────────────────────────────

  let voiceMode  = 'idle';
  let voiceError = null;
  let mediaRecorder  = null;
  let audioChunks    = [];
  let audioStream    = null;
  let analyserNode   = null;
  let audioContext   = null;
  let waveformRAF    = null;
  let recordingStart = 0;
  let timerInterval  = null;
  let transcriptText = '';
  let audioDuration  = 0;
  let transcriptionProvider = '';

  const micAvailable = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m + ':' + s.toString().padStart(2, '0');
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ── Voice functions ────────────────────────────────────────────────────

  async function startRecording() {
    voiceError = null;
    try {
      audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      voiceError = err.name === 'NotAllowedError'
        ? 'Microphone access denied. Please allow microphone access in your browser settings.'
        : 'No microphone found. Please connect a microphone and try again.';
      renderPanel();
      return;
    }

    audioChunks = [];
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(audioStream);
    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 128;
    source.connect(analyserNode);

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : '';

    mediaRecorder = new MediaRecorder(audioStream, mimeType ? { mimeType } : undefined);
    mediaRecorder.ondataavailable = function (e) { if (e.data.size > 0) audioChunks.push(e.data); };
    mediaRecorder.onstop = function () { audioStream.getTracks().forEach(function (t) { t.stop(); }); };

    mediaRecorder.start(250);
    recordingStart = Date.now();
    voiceMode = 'recording';
    renderPanel();
    initWaveform();
    startTimer();
  }

  function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
    stopWaveform();
    stopTimer();

    const elapsed = (Date.now() - recordingStart) / 1000;
    if (elapsed < 1) {
      voiceError = 'Recording too short. Hold the button longer and try again.';
      voiceMode = 'idle';
      audioChunks = [];
      renderPanel();
      return;
    }

    audioDuration = Math.round(elapsed);
    voiceMode = 'transcribing';
    renderPanel();
    setTimeout(function () { sendForTranscription(); }, 300);
  }

  function cancelRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
    stopWaveform();
    stopTimer();
    audioChunks = [];
    voiceMode = 'idle';
    voiceError = null;
    transcriptText = '';
    renderPanel();
  }

  async function sendForTranscription() {
    try {
      const blob = new Blob(audioChunks, { type: mediaRecorder?.mimeType || 'audio/webm' });
      const form = new FormData();
      form.append('audio', blob, 'recording.webm');

      const headers = {};
      if (apiKey) headers['x-grova-key'] = apiKey;

      const res = await fetch(TRANSCRIBE_URL, { method: 'POST', headers, body: form });

      if (!res.ok) {
        const body = await res.json().catch(function () { return {}; });
        throw new Error(body.error || 'Server returned ' + res.status);
      }

      const data = await res.json();
      transcriptText = data.transcript || '';
      transcriptionProvider = data.provider || '';
      audioDuration = data.duration_seconds || audioDuration;

      if (!transcriptText.trim()) {
        voiceError = 'No speech detected. Please try again or type your feedback.';
        voiceMode = 'idle';
      } else {
        voiceMode = 'review';
      }
    } catch (err) {
      console.warn('[grova] Transcription failed:', err.message);
      voiceError = 'Could not transcribe audio. Please try again or type your feedback.';
      voiceMode = 'idle';
    }

    audioChunks = [];
    renderPanel();
  }

  // ── Waveform visualizer ──────────────────────────────────────────────────

  function initWaveform() {
    const canvas = document.getElementById('gv-waveform');
    if (!canvas || !analyserNode) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const bufLen = analyserNode.frequencyBinCount;
    const dataArr = new Uint8Array(bufLen);

    function draw() {
      waveformRAF = requestAnimationFrame(draw);
      analyserNode.getByteFrequencyData(dataArr);

      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      const barCount = Math.min(bufLen, 32);
      const barW = Math.floor(w / barCount) - 2;
      const gap = 2;

      for (let i = 0; i < barCount; i++) {
        const val = dataArr[i] / 255;
        const barH = Math.max(2, val * h * 0.85);
        const x = i * (barW + gap) + gap;
        const y = (h - barH) / 2;

        ctx.fillStyle = 'rgba(0,200,122,' + (0.3 + val * 0.7) + ')';
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, barW, barH, 2);
        } else {
          ctx.rect(x, y, barW, barH);
        }
        ctx.fill();
      }
    }
    draw();
  }

  function stopWaveform() {
    if (waveformRAF) { cancelAnimationFrame(waveformRAF); waveformRAF = null; }
    if (audioContext) { audioContext.close().catch(function () {}); audioContext = null; }
    analyserNode = null;
  }

  function startTimer() {
    timerInterval = setInterval(function () {
      const t = document.getElementById('gv-rec-time');
      if (t) t.textContent = formatTime(Math.floor((Date.now() - recordingStart) / 1000));
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  function renderTrigger() {
    if (isOpen) {
      trigger.textContent = '';
      const sp1 = document.createElement('span');
      sp1.style.cssText = 'font-size:1.1rem;line-height:1;margin-right:-1px';
      sp1.textContent = '\u00d7';
      const sp2 = document.createElement('span');
      sp2.textContent = 'Close';
      trigger.appendChild(sp1);
      trigger.appendChild(sp2);
      trigger.classList.add('gv-trigger-open');
    } else {
      trigger.textContent = '';
      const svgContainer = document.createElement('span');
      svgContainer.innerHTML = ICON_CHAT;  // Safe: hardcoded SVG constant, not user input
      const svgNode = svgContainer.firstChild;
      const sp = document.createElement('span');
      sp.textContent = 'Feedback';
      trigger.appendChild(svgNode);
      trigger.appendChild(sp);
      trigger.classList.remove('gv-trigger-open');
    }
  }

  function buildFormHtml() {
    const segButtons = TYPES.map(function (t) {
      const active = activeType === t.value ? ' gv-seg-active' : '';
      return '<button class="gv-seg-btn' + active + '" data-type="' + t.value + '">' + escapeHtml(t.label) + '</button>';
    }).join('');
    const segControl = '<div class="gv-seg" id="gv-seg">' + segButtons + '<div class="gv-seg-indicator" id="gv-seg-ind"></div></div>';

    let inputArea = '';
    const voiceErrHtml = voiceError ? '<p class="gv-voice-err">' + escapeHtml(voiceError) + '</p>' : '';

    if (voiceMode === 'recording') {
      inputArea =
        '<div class="gv-recording">' +
          '<div class="gv-rec-header">' +
            '<div class="gv-rec-dot"></div>' +
            '<span class="gv-rec-label">Recording</span>' +
            '<span class="gv-rec-time" id="gv-rec-time">0:00</span>' +
          '</div>' +
          '<canvas class="gv-waveform" id="gv-waveform"></canvas>' +
          '<div class="gv-rec-actions">' +
            '<button class="gv-rec-btn" id="gv-rec-cancel">Cancel</button>' +
            '<button class="gv-rec-btn gv-rec-stop" id="gv-rec-stop">Stop</button>' +
          '</div>' +
        '</div>';
    } else if (voiceMode === 'transcribing') {
      inputArea =
        '<div class="gv-transcribing">' +
          '<div class="gv-transcribing-spinner"></div>' +
          '<span class="gv-transcribing-text">Transcribing\u2026</span>' +
        '</div>';
    } else if (voiceMode === 'review') {
      inputArea =
        '<div class="gv-voice-label">' +
          '<span class="gv-voice-tag">Voice transcript</span>' +
          '<button class="gv-rerecord" id="gv-rerecord">Re-record</button>' +
        '</div>' +
        '<textarea class="gv-textarea" id="gv-msg" placeholder="Edit transcript\u2026" rows="4">' + escapeHtml(transcriptText) + '</textarea>';
    } else {
      inputArea = voiceErrHtml +
        '<div class="gv-textarea-wrap">' +
          '<textarea class="gv-textarea" id="gv-msg" placeholder="Describe the issue\u2026" rows="4"' +
            (micAvailable ? ' style="padding-right:56px"' : '') + '></textarea>' +
          (micAvailable ? '<button class="gv-mic" id="gv-mic" aria-label="Record voice feedback" title="Record voice feedback">' + ICON_MIC + '</button>' : '') +
        '</div>';
    }

    const disableSubmit = voiceMode === 'recording' || voiceMode === 'transcribing';
    const showExtras = voiceMode !== 'recording' && voiceMode !== 'transcribing';

    return '<div class="gv-inner">' +
      '<div class="gv-header">' +
        '<div>' +
          '<div class="gv-eyebrow">Feedback</div>' +
          '<div class="gv-logo">' +
            '<div class="gv-logo-mark"></div>' +
            '<span class="gv-logo-name">grova</span>' +
          '</div>' +
        '</div>' +
        '<button class="gv-close" id="gv-x" aria-label="Close">\u00d7</button>' +
      '</div>' +
      segControl +
      inputArea +
      (showExtras ?
        '<input class="gv-email" id="gv-email" type="email" placeholder="Email (optional)" />' +
        '<div class="gv-screenshot-row">' +
          '<div class="gv-toggle gv-toggle-on" id="gv-toggle" role="switch" aria-checked="true" tabindex="0"></div>' +
          '<input type="checkbox" id="gv-screenshot" checked style="display:none" />' +
          '<span class="gv-screenshot-text">Attach screenshot</span>' +
        '</div>' : '') +
      (status === 'error' ? '<p class="gv-err">Something went wrong \u2014 try again.</p>' : '') +
      '<button class="gv-submit" id="gv-sub"' + (disableSubmit ? ' disabled' : '') + '>Send Feedback</button>' +
    '</div>' +
    '<div class="gv-footer">Powered by <a href="https://grova.dev" target="_blank" rel="noreferrer">grova.dev</a></div>';
  }

  function renderPanel() {
    if (status === 'success') {
      // Build success view using DOM methods
      panel.textContent = '';
      const successDiv = document.createElement('div');
      successDiv.className = 'gv-success';

      const checkDiv = document.createElement('div');
      checkDiv.className = 'gv-success-check';
      checkDiv.textContent = '\u2713';

      const titleP = document.createElement('p');
      titleP.className = 'gv-success-title';
      titleP.textContent = 'Received.';

      const subP = document.createElement('p');
      subP.className = 'gv-success-sub';
      subP.textContent = "We'll look into it.";

      const closeBtn = document.createElement('button');
      closeBtn.className = 'gv-success-close';
      closeBtn.textContent = 'Close';
      closeBtn.addEventListener('click', close);

      successDiv.appendChild(checkDiv);
      successDiv.appendChild(titleP);
      successDiv.appendChild(subP);
      successDiv.appendChild(closeBtn);
      panel.appendChild(successDiv);
      return;
    }

    // The form HTML uses only hardcoded markup + escapeHtml() for user text
    panel.innerHTML = buildFormHtml();  // Safe: all dynamic content is escaped via escapeHtml()

    // ── Event binding ──

    // Segmented control
    var segContainer = document.getElementById('gv-seg');
    var segIndicator = document.getElementById('gv-seg-ind');
    var segBtns = panel.querySelectorAll('.gv-seg-btn');

    function updateSegIndicator() {
      var activeBtn = segContainer && segContainer.querySelector('.gv-seg-active');
      if (activeBtn && segIndicator) {
        segIndicator.style.left = activeBtn.offsetLeft + 'px';
        segIndicator.style.width = activeBtn.offsetWidth + 'px';
      }
    }

    segBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeType = btn.dataset.type;
        segBtns.forEach(function (b) { b.classList.remove('gv-seg-active'); });
        btn.classList.add('gv-seg-active');
        updateSegIndicator();
      });
    });

    requestAnimationFrame(updateSegIndicator);

    const msgEl = document.getElementById('gv-msg');
    const subEl = document.getElementById('gv-sub');
    const disableSubmit = voiceMode === 'recording' || voiceMode === 'transcribing';

    if (msgEl && subEl && !disableSubmit) {
      if (voiceMode === 'review') subEl.disabled = !msgEl.value.trim();
      msgEl.addEventListener('input', function () { subEl.disabled = !msgEl.value.trim(); });
    }

    if (subEl) subEl.addEventListener('click', submit);
    document.getElementById('gv-x').addEventListener('click', close);

    const micBtn = document.getElementById('gv-mic');
    if (micBtn) micBtn.addEventListener('click', startRecording);

    const recCancel = document.getElementById('gv-rec-cancel');
    if (recCancel) recCancel.addEventListener('click', cancelRecording);

    const recStop = document.getElementById('gv-rec-stop');
    if (recStop) recStop.addEventListener('click', stopRecording);

    const rerecord = document.getElementById('gv-rerecord');
    if (rerecord) rerecord.addEventListener('click', function () {
      transcriptText = '';
      voiceMode = 'idle';
      voiceError = null;
      renderPanel();
    });

    // Toggle switch for screenshot
    var toggleEl = document.getElementById('gv-toggle');
    var screenshotInput = document.getElementById('gv-screenshot');
    if (toggleEl && screenshotInput) {
      toggleEl.addEventListener('click', function () {
        screenshotInput.checked = !screenshotInput.checked;
        toggleEl.classList.toggle('gv-toggle-on', screenshotInput.checked);
        toggleEl.setAttribute('aria-checked', String(screenshotInput.checked));
      });
      toggleEl.addEventListener('keydown', function (e) {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggleEl.click(); }
      });
    }

    if (voiceMode === 'recording') {
      requestAnimationFrame(function () { initWaveform(); });
    }
  }

  // ── Actions ──────────────────────────────────────────────────────────────

  async function submit() {
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
    if (subEl) { subEl.disabled = true; subEl.textContent = 'Sending\u2026'; subEl.style.textTransform = 'none'; }

    const metadata = collectMetadata();
    const console_errors = _grovaErrors.length ? [].concat(_grovaErrors) : null;

    // Voice metadata
    if (voiceMode === 'review') {
      metadata.submission_type = 'voice';
      metadata.audio_duration_seconds = audioDuration;
      metadata.transcription_provider = transcriptionProvider;
    }

    let screenshot = null;
    const screenshotChecked = document.getElementById('gv-screenshot')?.checked;

    if (screenshotChecked) {
      try {
        if (subEl) subEl.textContent = 'Capturing\u2026';
        root.style.display = 'none';
        backdrop.style.display = 'none';

        if (!window.html2canvas) {
          await new Promise(function (resolve, reject) {
            const s = document.createElement('script');
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            s.integrity = 'sha384-ZZ1pncU3bQe8y31yfZdMFdSpttDoPmOZg2wguVK9almUodir1PghgT0eY7Mrty8H';
            s.crossOrigin = 'anonymous';
            s.onload = resolve;
            s.onerror = function () { reject(new Error('Failed to load html2canvas')); };
            document.head.appendChild(s);
          });
        }

        const canvas = await window.html2canvas(document.body, { scale: 0.5, useCORS: true, logging: false });
        screenshot = canvas.toDataURL('image/jpeg', 0.6);
        root.style.display = '';
        backdrop.style.display = '';
      } catch (err) {
        root.style.display = '';
        backdrop.style.display = '';
        console.warn('[grova] Screenshot capture failed:', err.message);
      }
    }

    if (subEl) subEl.textContent = 'Sending\u2026';

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (apiKey) headers['x-grova-key'] = apiKey;

      const res = await fetch(API, {
        method: 'POST',
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

    if (status === 'success') {
      voiceMode = 'idle';
      transcriptText = '';
      voiceError = null;
      audioDuration = 0;
      transcriptionProvider = '';
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
    requestAnimationFrame(function () { document.getElementById('gv-msg')?.focus(); });
  }

  function close() {
    isOpen = false;
    panel.classList.remove('gv-open');
    backdrop.classList.remove('gv-open');
    renderTrigger();
    if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
    stopWaveform();
    stopTimer();
    setTimeout(function () {
      status = 'idle';
      activeType = 'bug';
      voiceMode = 'idle';
      voiceError = null;
      transcriptText = '';
      audioChunks = [];
    }, 280);
  }

  // ── Event listeners ──────────────────────────────────────────────────────

  trigger.addEventListener('click', function () { isOpen ? close() : open(); });
  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen) close(); });
  document.addEventListener('mousedown', function (e) {
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
