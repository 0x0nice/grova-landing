"use client";

import { useState, type KeyboardEvent } from "react";
import { trackEvent } from "@/providers/analytics-provider";

interface WaitlistFormProps {
  className?: string;
}

export function WaitlistForm({ className = "" }: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit() {
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setError(true);
      return;
    }
    setError(false);
    setStatus("loading");

    try {
      const res = await fetch(
        `https://formspree.io/f/${process.env.NEXT_PUBLIC_FORMSPREE_ID}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ email: trimmed }),
        }
      );
      if (res.ok) {
        setStatus("success");
        trackEvent("waitlist_submitted", { email: trimmed });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter") handleSubmit();
  }

  if (status === "success") {
    return (
      <p className={`text-[0.76rem] text-[var(--track-accent)] tracking-[0.02em] py-3 ${className}`}>
        You&apos;re on the list. We&apos;ll be in touch.
      </p>
    );
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-[1fr_auto] gap-2 max-w-[460px] max-sm:grid-cols-1">
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(false); }}
          onKeyDown={handleKeyDown}
          placeholder="your@email.com"
          aria-label="Email address"
          className={`
            flex-1 bg-surface border rounded
            px-4 py-3 text-callout text-text
            placeholder:text-text3
            outline-none transition-colors duration-[180ms]
            focus:border-[var(--track-accent)]
            ${error ? "border-[#e74c3c]" : "border-border2"}
          `}
        />
        <button
          onClick={handleSubmit}
          disabled={status === "loading"}
          className="bg-[var(--track-accent)] text-white border-none rounded
                     px-[18px] py-3 text-[0.78rem] font-semibold
                     cursor-pointer whitespace-nowrap
                     inline-flex items-center justify-center gap-2
                     transition-colors duration-[180ms]
                     hover:brightness-90
                     disabled:opacity-35 disabled:cursor-not-allowed"
        >
          {status === "loading" ? (
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeDasharray="45" strokeLinecap="round" />
            </svg>
          ) : status === "error" ? "Try again" : "Join waitlist"}
        </button>
      </div>
    </div>
  );
}
