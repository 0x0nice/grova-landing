"use client";

import { useState, type KeyboardEvent } from "react";

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
      setStatus(res.ok ? "success" : "error");
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
          className={`
            flex-1 bg-surface border rounded
            px-4 py-3 font-mono text-callout font-light text-text
            placeholder:text-text3
            outline-none transition-colors duration-[180ms]
            focus:border-[var(--track-accent)]
            ${error ? "border-[#e74c3c]" : "border-border2"}
          `}
        />
        <button
          onClick={handleSubmit}
          disabled={status === "loading"}
          className="bg-[var(--track-accent)] text-black border-none rounded
                     px-[18px] py-3 font-mono text-[0.75rem] font-medium
                     cursor-pointer whitespace-nowrap tracking-[0.05em] uppercase
                     transition-opacity duration-150 hover:opacity-82
                     disabled:opacity-35 disabled:cursor-not-allowed"
        >
          {status === "loading" ? "..." : status === "error" ? "Try again" : "Join waitlist"}
        </button>
      </div>
    </div>
  );
}
