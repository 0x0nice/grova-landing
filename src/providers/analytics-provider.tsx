"use client";

import { useEffect } from "react";

// Lightweight PostHog wrapper that no-ops when not configured.
// This avoids requiring posthog-js as a hard dependency.

let posthogInstance: {
  capture: (event: string, properties?: Record<string, unknown>) => void;
} | null = null;

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;

    // Only initialize if user has explicitly accepted cookies (GDPR)
    let consent: string | null = null;
    try { consent = localStorage.getItem("grova-cookie-consent"); } catch {}
    if (consent !== "accepted") return;

    // Dynamic import to avoid bundling when not configured
    import("posthog-js")
      .then((mod) => {
        const posthog = mod.default;
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
          api_host:
            process.env.NEXT_PUBLIC_POSTHOG_HOST ||
            "https://us.i.posthog.com",
          capture_pageview: true,
          persistence: "localStorage+cookie",
        });
        posthogInstance = posthog;
      })
      .catch(() => {
        // PostHog not available — no-op
      });
  }, []);

  return <>{children}</>;
}

/**
 * Track a custom event. No-ops when PostHog is not initialized.
 */
export function trackEvent(
  name: string,
  properties?: Record<string, unknown>
) {
  if (posthogInstance) {
    posthogInstance.capture(name, properties);
  }
}
