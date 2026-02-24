// Sentry initialization for frontend error tracking.
// No-ops gracefully when NEXT_PUBLIC_SENTRY_DSN is not set.
// Uses dynamic import() (NOT require()) so @sentry/react is never
// included in the client JS bundle unless the DSN is actually configured.

interface SentryLike {
  captureException: (error: unknown, opts?: Record<string, unknown>) => void;
}

const stub: SentryLike = { captureException: () => {} };

let sentry: SentryLike = stub;

export function initSentry() {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;

  // Dynamic import() — bundler will code-split this, not inline it
  import("@sentry/react")
    .then((mod) => {
      mod.init({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN!,
        environment: process.env.NODE_ENV,
        tracesSampleRate: 0.1,
      });
      sentry = mod;
    })
    .catch(() => {
      // @sentry/react not available — keep using stub
    });
}

export function captureException(
  error: unknown,
  opts?: Record<string, unknown>,
) {
  sentry.captureException(error, opts);
}
