"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { OnboardingData } from "./onboarding-wizard";

interface StepInstallProps {
  data: OnboardingData;
  onNext: () => void;
  onBack: () => void;
}

export function StepInstall({ data, onNext, onBack }: StepInstallProps) {
  const [copied, setCopied] = useState(false);

  const widgetFile =
    data.track === "developer"
      ? "grova-widget.js"
      : "grova-business-widget.js";

  const snippet = `<script
  src="https://grova.dev/${widgetFile}"
  data-source="${data.projectSource || data.projectName.toLowerCase().replace(/\s+/g, "-")}"${
    data.apiKey ? `\n  data-key="${data.apiKey}"` : ""
  }
></script>`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }

  return (
    <div className="bg-surface border border-border rounded p-8">
      <span className="block font-mono text-caption text-text3 tracking-[0.16em] uppercase mb-3">
        Step 4 of 5
      </span>
      <h2 className="font-serif text-title font-normal tracking-[-0.025em] leading-[1.1] text-text mb-2">
        Install the <em className="text-text2">widget.</em>
      </h2>
      <p className="font-mono text-callout text-text2 leading-[1.7] mb-6">
        Paste this snippet before the closing{" "}
        <code className="text-accent">&lt;/body&gt;</code> tag on your site.
      </p>

      <div className="relative mb-6">
        <pre className="bg-bg border border-border rounded p-4 overflow-x-auto text-[0.72rem] leading-[1.7] text-text2 font-mono">
          {snippet}
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 font-mono text-micro text-text3 hover:text-text2
                     px-2 py-1 rounded border border-border hover:border-border2
                     transition-colors cursor-pointer bg-surface"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {data.apiKey && (
        <div className="mb-6 p-3 bg-bg border border-border rounded">
          <span className="block font-mono text-micro text-text3 uppercase tracking-[0.08em] mb-1">
            Your API Key
          </span>
          <code className="font-mono text-footnote text-accent break-all">
            {data.apiKey}
          </code>
        </div>
      )}

      <p className="font-mono text-micro text-text3 leading-[1.6] mb-6">
        The widget will appear as a floating feedback button on your site. Users
        can report bugs, request features, and provide feedback directly.
      </p>

      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="font-mono text-footnote text-text3 hover:text-text2 transition-colors cursor-pointer"
        >
          Back
        </button>
        <Button variant="fill" onClick={onNext}>
          Continue
        </Button>
      </div>
    </div>
  );
}
