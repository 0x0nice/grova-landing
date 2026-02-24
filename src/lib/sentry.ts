// Sentry initialization for frontend error tracking.
// No-ops gracefully when NEXT_PUBLIC_SENTRY_DSN is not set.

let Sentry: {
  init: (opts: Record<string, unknown>) => void;
  captureException: (error: unknown, opts?: Record<string, unknown>) => void;
};

// Use a lightweight stub when Sentry is not configured
const stub = {
  init: () => {},
  captureException: () => {},
};

export function initSentry() {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry = stub;
    return;
  }

  try {
    // Dynamic import to avoid bundling Sentry when not configured
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const SentryModule = require("@sentry/react");
    SentryModule.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1,
    });
    Sentry = SentryModule;
  } catch {
    Sentry = stub;
  }
}

export function captureException(
  error: unknown,
  opts?: Record<string, unknown>
) {
  if (Sentry) {
    Sentry.captureException(error, opts);
  }
}

export { Sentry };
