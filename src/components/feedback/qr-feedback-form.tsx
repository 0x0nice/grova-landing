"use client";

import { useState, useEffect, useRef } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "";

const CATEGORIES = ["Complaint", "Compliment", "Question", "Suggestion", "Other"];

const PLACEHOLDERS: Record<string, string> = {
  Complaint: "Tell us what happened so we can make it right\u2026",
  Compliment: "What did we do well? We\u2019d love to hear\u2026",
  Question: "What would you like to know?",
  Suggestion: "How could we improve?",
  Other: "What\u2019s on your mind?",
};

interface ProjectInfo {
  id: string;
  name: string;
  mode: string;
}

function collectMetadata() {
  const ua = navigator.userAgent;
  let browser = "Unknown";
  if (ua.includes("CriOS")) browser = "Chrome (iOS)";
  else if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edg")) browser = "Edge";

  let os = "Unknown";
  if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";
  else if (/Android/.test(ua)) os = "Android";
  else if (/Mac/.test(ua)) os = "macOS";
  else if (/Win/.test(ua)) os = "Windows";
  else if (/Linux/.test(ua)) os = "Linux";

  const touch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

  return {
    browser,
    os,
    device_type: touch ? "mobile" : "desktop",
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    touch,
  };
}

const DEMO_PROJECT: ProjectInfo = {
  id: "demo-biz",
  name: "Corner Bistro",
  mode: "business",
};

export function QrFeedbackForm({ apiKey }: { apiKey: string }) {
  const isDemo = apiKey === "demo";
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [status, setStatus] = useState<
    "loading" | "ready" | "sending" | "success" | "not_found" | "error"
  >(isDemo ? "ready" : "loading");
  const [project, setProject] = useState<ProjectInfo | null>(
    isDemo ? DEMO_PROJECT : null
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch project info on mount (skip in demo mode)
  useEffect(() => {
    if (isDemo) return;
    async function load() {
      try {
        const res = await fetch(`${API}/public/project/${apiKey}`);
        if (res.status === 404) {
          setStatus("not_found");
          return;
        }
        if (!res.ok) {
          setStatus("error");
          return;
        }
        const data = await res.json();
        setProject(data);
        setStatus("ready");
      } catch {
        setStatus("error");
      }
    }
    load();
  }, [apiKey, isDemo]);

  // Auto-focus textarea on step 2
  useEffect(() => {
    if (step === 2 && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [step]);

  function handleCategorySelect(cat: string) {
    setSelectedCategory(cat);
    setErrorMessage(null);
    setStep(2);
  }

  function handleBack() {
    setStep(1);
    setErrorMessage(null);
  }

  function handleReset() {
    setStep(1);
    setSelectedCategory(null);
    setMessage("");
    setName("");
    setEmail("");
    setErrorMessage(null);
    setStatus("ready");
  }

  async function handleSubmit() {
    if (!project || !selectedCategory || message.trim().length < 3) return;

    setStatus("sending");
    setErrorMessage(null);

    try {
      const meta = collectMetadata();
      if (name.trim()) (meta as Record<string, unknown>).customer_name = name.trim();
      const body: Record<string, unknown> = {
        type: selectedCategory,
        message: message.trim(),
        email: email.trim() || null,
        page: `/f?k=${apiKey}`,
        timestamp: new Date().toISOString(),
        source: "qr",
        metadata: meta,
      };
      // Only attach project_id for real projects (not demo)
      if (!isDemo) body.project_id = project.id;

      const res = await fetch(`${API}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.status === 429) {
        const data = await res.json().catch(() => ({}));
        setErrorMessage(
          data.resets_at
            ? "This business has reached its feedback limit for the month."
            : "Too many requests. Please wait a moment and try again."
        );
        setStatus("ready");
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMessage(data.error || "Something went wrong. Please try again.");
        setStatus("ready");
        return;
      }

      setStep(3);
      setStatus("success");
    } catch {
      setErrorMessage("You appear to be offline. Please check your connection.");
      setStatus("ready");
    }
  }

  // ── Loading state ──
  if (status === "loading") {
    return (
      <div className="w-full max-w-[400px] flex flex-col items-center gap-6 py-12">
        <span className="font-serif text-[1.1rem] text-text3 animate-pulse">
          grova
        </span>
        <div className="w-full flex flex-col gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-[48px] rounded-[8px] bg-surface animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // ── Not found state ──
  if (status === "not_found") {
    return (
      <div className="w-full max-w-[400px] flex flex-col items-center gap-4 py-12 text-center">
        <span className="font-serif text-[1.1rem] text-text3">grova</span>
        <h1 className="font-serif text-title text-text italic">
          Link not found
        </h1>
        <p className="text-body text-text3 leading-[1.7]">
          This feedback link isn&apos;t active or doesn&apos;t exist.
        </p>
      </div>
    );
  }

  // ── Generic error state ──
  if (status === "error" && step === 1 && !project) {
    return (
      <div className="w-full max-w-[400px] flex flex-col items-center gap-4 py-12 text-center">
        <span className="font-serif text-[1.1rem] text-text3">grova</span>
        <h1 className="font-serif text-title text-text italic">
          Something went wrong
        </h1>
        <p className="text-body text-text3 leading-[1.7]">
          We couldn&apos;t load this feedback form. Please try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="font-mono text-footnote text-accent underline underline-offset-4 mt-2"
        >
          Retry
        </button>
      </div>
    );
  }

  // ── Screen 1: Category selection ──
  if (step === 1) {
    return (
      <div className="w-full max-w-[400px] flex flex-col py-8">
        <span className="font-serif text-[1.1rem] text-text3 mb-8">grova</span>
        <h1 className="font-serif text-title text-text italic leading-[1.2] mb-2">
          How was your experience
          {project?.name ? (
            <>
              {" "}at{" "}
              <span className="text-text not-italic">{project.name}</span>
            </>
          ) : null}
          ?
        </h1>
        <p className="text-subheadline text-text3 mb-8">Tap one to continue</p>

        <div className="flex flex-col gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className="w-full min-h-[48px] px-5 py-3 rounded-[8px]
                bg-surface border border-border2
                font-mono text-body text-text2
                text-left transition-all duration-150
                active:scale-[0.98] hover:border-text3"
            >
              {cat}
            </button>
          ))}
        </div>

        <PoweredBy />
      </div>
    );
  }

  // ── Screen 2: Message + Email ──
  if (step === 2) {
    const canSubmit = message.trim().length >= 3 && status !== "sending";

    return (
      <div className="w-full max-w-[400px] flex flex-col py-8">
        {/* Back + breadcrumb */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={handleBack}
            className="font-mono text-footnote text-text3 hover:text-text2 transition-colors"
          >
            ← Back
          </button>
          <span className="font-mono text-micro text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-full">
            {selectedCategory}
          </span>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={PLACEHOLDERS[selectedCategory || "Other"]}
          rows={5}
          className="w-full p-4 rounded-[8px] bg-surface border border-border2
            font-mono text-body text-text placeholder:text-text3
            resize-none focus:outline-none focus:border-text3
            transition-colors duration-150
            text-[1rem]"
          style={{ fontSize: "1rem" }}
        />

        {/* Name */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name (optional)"
          className="w-full mt-3 px-4 py-3 rounded-[8px] bg-surface border border-border2
            font-mono text-body text-text placeholder:text-text3
            focus:outline-none focus:border-text3
            transition-colors duration-150
            text-[1rem]"
          style={{ fontSize: "1rem" }}
        />

        {/* Email */}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email (optional — so we can follow up)"
          className="w-full mt-3 px-4 py-3 rounded-[8px] bg-surface border border-border2
            font-mono text-body text-text placeholder:text-text3
            focus:outline-none focus:border-text3
            transition-colors duration-150
            text-[1rem]"
          style={{ fontSize: "1rem" }}
        />

        {/* Error message */}
        {errorMessage && (
          <p className="mt-3 text-footnote text-red font-mono">{errorMessage}</p>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full mt-5 py-3.5 rounded-[8px] font-mono text-body font-medium
            transition-all duration-150
            bg-accent text-black
            disabled:opacity-40 disabled:cursor-not-allowed
            active:scale-[0.98]"
          style={{ paddingBottom: "calc(0.875rem + env(safe-area-inset-bottom, 0px))" }}
        >
          {status === "sending" ? "Sending\u2026" : "Send Feedback"}
        </button>

        <PoweredBy />
      </div>
    );
  }

  // ── Screen 3: Thank you ──
  return (
    <div className="w-full max-w-[400px] flex flex-col items-center py-12 text-center">
      {/* Success icon */}
      <div className="w-14 h-14 rounded-full bg-accent/15 flex items-center justify-center mb-5">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-accent">
          <path
            d="M20 6L9 17l-5-5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h1 className="font-serif text-title text-text italic mb-2">Thank you!</h1>
      <p className="text-body text-text3 leading-[1.7] mb-8">
        Your feedback helps{" "}
        {project?.name ? (
          <span className="text-text2">{project.name}</span>
        ) : (
          "us"
        )}{" "}
        improve.
      </p>

      <button
        onClick={handleReset}
        className="font-mono text-footnote text-text3 hover:text-text2
          underline underline-offset-4 transition-colors"
      >
        Submit another
      </button>

      <PoweredBy />
    </div>
  );
}

function PoweredBy() {
  return (
    <p className="mt-auto pt-8 text-center">
      <span className="font-mono text-micro text-text3 tracking-[0.08em]">
        Powered by{" "}
        <a
          href="https://grova.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="text-text3 hover:text-text2 underline underline-offset-2 transition-colors"
        >
          Grova
        </a>
      </span>
    </p>
  );
}
