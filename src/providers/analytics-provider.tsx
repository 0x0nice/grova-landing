"use client";

// PostHog analytics stub - currently a no-op.
// When you're ready to enable analytics:
//   1. npm install posthog-js
//   2. Set NEXT_PUBLIC_POSTHOG_KEY in .env.local
//   3. Uncomment the dynamic import in AnalyticsProvider below

const posthogInstance: {
  capture: (event: string, properties?: Record<string, unknown>) => void;
} | null = null;

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  // No-op until PostHog is configured
  // To enable: uncomment the useEffect below and install posthog-js
  //
  // useEffect(() => {
  //   if (typeof window === "undefined") return;
  //   if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  //   let consent: string | null = null;
  //   try { consent = localStorage.getItem("grova-cookie-consent"); } catch {}
  //   if (consent !== "accepted") return;
  //   import("posthog-js").then((mod) => {
  //     const posthog = mod.default;
  //     posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  //       api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
  //       capture_pageview: true,
  //       persistence: "localStorage+cookie",
  //     });
  //     posthogInstance = posthog;
  //   }).catch(() => {});
  // }, []);

  return <>{children}</>;
}

/**
 * Track a custom event. No-ops when PostHog is not initialized.
 */
export function trackEvent(
  name: string,
  properties?: Record<string, unknown>,
) {
  if (posthogInstance) {
    posthogInstance.capture(name, properties);
  }
}
