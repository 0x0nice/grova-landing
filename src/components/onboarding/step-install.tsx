"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HelpTip } from "@/components/ui/help-tip";
import type { OnboardingData } from "./onboarding-wizard";

interface StepInstallProps {
  data: OnboardingData;
  onNext: () => void;
  onBack: () => void;
}

export function StepInstall({ data, onNext, onBack }: StepInstallProps) {
  const [copied, setCopied] = useState(false);
  const [keyCopied, setKeyCopied] = useState(false);

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

  async function handleCopyKey() {
    if (!data.apiKey) return;
    try {
      await navigator.clipboard.writeText(data.apiKey);
      setKeyCopied(true);
      setTimeout(() => setKeyCopied(false), 2000);
    } catch {
      // fallback
    }
  }

  return (
    <div className="bg-surface border border-border rounded p-8">
      <span className="block font-mono text-caption text-text3 tracking-[0.16em] uppercase mb-3">
        Step 4 of 5
      </span>
      <h2 className="font-serif text-title font-normal tracking-[-0.02em] leading-[1.1] text-text mb-2">
        Install the <em className="text-text2">widget.</em>
      </h2>
      <p className="font-mono text-callout text-text2 leading-[1.7] mb-6">
        Paste this snippet before the closing{" "}
        <code className="text-accent">&lt;/body&gt;</code> tag on your site.
        <HelpTip>
          {data.track === "developer" ? (
            <>
              Add this <strong className="text-text">script tag</strong> to any page where
              you want the feedback widget to appear. It loads a small JavaScript
              file that renders a floating button in the corner of the page.
              <br /><br />
              Works with any framework — React, Next.js, plain HTML, etc.
              Just paste it before <code className="text-accent bg-bg px-1 rounded">&lt;/body&gt;</code>.
            </>
          ) : (
            <>
              Add this <strong className="text-text">script tag</strong> to your website
              to show a feedback button for your customers. It works on any
              website — Squarespace, WordPress, Wix, or plain HTML.
              <br /><br />
              Just paste it right before the <code className="text-accent bg-bg px-1 rounded">&lt;/body&gt;</code> closing
              tag in your site&apos;s HTML.
            </>
          )}
        </HelpTip>
      </p>

      {/* Snippet breakdown */}
      <div className="mb-4">
        <div className="flex items-center gap-1 mb-2">
          <span className="font-mono text-micro text-text3 uppercase tracking-[0.08em]">
            Embed Snippet
          </span>
          <HelpTip>
            This is the code you paste into your website. Each attribute
            tells the widget how to connect to your Grova project:
            <br /><br />
            <strong className="text-text">src</strong> — loads the widget script
            <br />
            <strong className="text-text">data-source</strong> — links feedback
            to your project (matches the source identifier you chose)
            {data.apiKey && (
              <>
                <br />
                <strong className="text-text">data-key</strong> — your API key
                that authenticates the widget
              </>
            )}
          </HelpTip>
        </div>
        <div className="relative">
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
      </div>

      {data.apiKey && (
        <div className="mb-6 p-3 bg-bg border border-border rounded">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-micro text-text3 uppercase tracking-[0.08em] flex items-center">
              Your API Key
              <HelpTip>
                This key authenticates the widget on your site. It&apos;s included in the
                snippet above as <code className="text-accent bg-bg px-1 rounded">data-key</code>.
                <br /><br />
                <strong className="text-text">Save it somewhere safe.</strong> You can
                always find it again in <strong className="text-text">Dashboard → Settings</strong>.
              </HelpTip>
            </span>
            <button
              onClick={handleCopyKey}
              className="font-mono text-micro text-accent hover:text-accent/80
                         transition-colors cursor-pointer"
            >
              {keyCopied ? "Copied!" : "Copy key"}
            </button>
          </div>
          <code className="font-mono text-footnote text-accent break-all">
            {data.apiKey}
          </code>
        </div>
      )}

      <p className="font-mono text-micro text-text3 leading-[1.6] mb-6">
        {data.track === "developer"
          ? "The widget will appear as a floating feedback button on your site. Users can report bugs, request features, and provide feedback directly."
          : "The widget will appear as a floating button on your site. Customers can leave feedback, complaints, or compliments organized by category."}
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
