"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("grova-cookie-consent");
      if (!consent) {
        // Small delay so it doesn't flash immediately on load
        const timer = setTimeout(() => setVisible(true), 1500);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage may be blocked by corporate browser policies - silently skip
    }
  }, []);

  function handleAccept() {
    try { localStorage.setItem("grova-cookie-consent", "accepted"); } catch {}
    setVisible(false);
  }

  function handleDecline() {
    try { localStorage.setItem("grova-cookie-consent", "declined"); } catch {}
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-[420px]
                 bg-surface-raised border border-border rounded-lg p-4 z-[9999]
                 animate-in slide-in-from-bottom-4 duration-300"
      role="alert"
      aria-live="polite"
    >
      <p className="text-footnote text-text2 mb-3">
        We use essential cookies for authentication and preferences. Optional
        analytics cookies help us improve the product.{" "}
        <Link
          href="/privacy"
          className="text-accent hover:underline"
        >
          Privacy Policy
        </Link>
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={handleDecline}
          className="font-medium text-[0.7rem] text-text3 hover:text-text2
                     px-3 py-1.5 rounded border border-border hover:border-border2
                     transition-colors cursor-pointer"
        >
          Decline
        </button>
        <button
          onClick={handleAccept}
          className="font-medium text-[0.7rem] text-black
                     px-3 py-1.5 rounded bg-accent hover:opacity-90
                     transition-opacity cursor-pointer"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
