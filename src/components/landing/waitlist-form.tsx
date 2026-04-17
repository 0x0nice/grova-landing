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
        You&apos;re on the list — we&apos;ll be in touch.
      </p>
    );
  }

  return (
    <div className={className}>
      <div className="flex gap-2 max-w-[420px]">
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(false); }}
          onKeyDown={handleKeyDown}
          placeholder="your@email.com"
          aria-label="Email address"
          className={`
            flex-1 bg-surface border rounded
            px-4 py-3 font-mono text-callout font-light text-text
            placeholder:text-text3
            outline-none transition-all duration-[180ms]
            focus:border-[var(--track-accent)]
            focus:shadow-[0_0_0_4px_color-mix(in_oklch,var(--track-accent)_15%,transparent)]
            ${error ? "border-[#e74c3c]" : "border-border2"}
          `}
        />
        <button
          onClick={handleSubmit}
          disabled={status === "loading"}
          className="bg-[var(--track-accent)] text-black border-none rounded
                     px-[18px] py-3 font-mono text-[0.75rem] font-medium
                     cursor-pointer whitespace-nowrap tracking-[0.04em] uppercase
                     inline-flex items-center justify-center gap-2
                     [html[data-theme=dark]_&]:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]
                     transition-all duration-[180ms]
                     hover:opacity-92 hover:-translate-y-px hover:shadow-sm
                     active:scale-[0.98] active:translate-y-0
                     disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:transform-none"
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
