"use client";

import { useState } from "react";

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */
function CopyIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.334a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface WidgetInstallSectionProps {
  mode: "developer" | "business";
  source: string;
  apiKey: string;
  projectName: string;
  businessType?: string;
  businessName?: string;
  categories?: string[];
  onCopy?: (label: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Snippet builders                                                   */
/* ------------------------------------------------------------------ */
function buildDevSnippet(source: string, apiKey: string): string {
  let s = `<script\n  src="https://grova.dev/grova-widget.js"\n  data-source="${source || "your-app"}"`;
  if (apiKey) s += `\n  data-key="${apiKey}"`;
  s += `\n></script>`;
  return s;
}

function buildBizSnippet(
  source: string,
  apiKey: string,
  businessType?: string,
  businessName?: string,
  categories?: string[]
): string {
  let s = `<script\n  src="https://grova.dev/grova-business-widget.js"\n  data-source="${source || "your-business"}"`;
  if (apiKey) s += `\n  data-key="${apiKey}"`;
  if (businessType && businessType !== "default") s += `\n  data-business-type="${businessType}"`;
  if (businessName) s += `\n  data-name="${businessName.replace(/"/g, "&quot;")}"`;
  if (categories?.length) s += `\n  data-categories="${categories.join(",")}"`;
  s += `\n></script>`;
  return s;
}

/* ------------------------------------------------------------------ */
/*  AI prompt builders                                                 */
/* ------------------------------------------------------------------ */
function buildDevPrompt(source: string, apiKey: string): string {
  const snippet = buildDevSnippet(source, apiKey);
  return `Add the Grova feedback widget to this project. Here is my pre-configured script tag — do not change any of the data- attribute values:

${snippet}

Choose the right approach for this project's framework:

**Next.js (App Router)**
Import Script from "next/script" and add inside the <body> in app/layout.tsx:
\`\`\`tsx
import Script from "next/script"

// inside <body>, after {children}:
<Script
  src="https://grova.dev/grova-widget.js"
  data-source="${source || "your-app"}"${apiKey ? `\n  data-key="${apiKey}"` : ""}
  strategy="lazyOnload"
/>
\`\`\`

**Next.js (Pages Router)**
Add to pages/_app.tsx using next/script with the same pattern above.

**React (Vite / CRA)**
Add the <script> tag to index.html right before </body>.

**Vue / Nuxt / Svelte / Astro**
Add the <script> tag to your main HTML template or layout before </body>.

**Plain HTML**
Add the <script> tag before </body> on each page.

Important:
- Do NOT modify data-source or data-key values — they are specific to my Grova project
- The widget renders a floating feedback button automatically — no extra CSS or HTML needed
- After adding it, run the dev server and verify the widget appears in the bottom-right corner`;
}

function buildBizPrompt(
  source: string,
  apiKey: string,
  businessType?: string,
  businessName?: string,
  categories?: string[]
): string {
  const snippet = buildBizSnippet(source, apiKey, businessType, businessName, categories);
  return `Add the Grova review widget to this website. Here is my pre-configured script tag — do not change any of the data- attribute values:

${snippet}

Choose the right approach for this site's platform:

**Next.js**
Import Script from "next/script" and add inside the <body> in app/layout.tsx:
\`\`\`tsx
import Script from "next/script"

// inside <body>, after {children}:
<Script
  src="https://grova.dev/grova-business-widget.js"
  data-source="${source || "your-business"}"${apiKey ? `\n  data-key="${apiKey}"` : ""}
  strategy="lazyOnload"
/>
\`\`\`

**WordPress**
Add to your theme's footer.php before </body>, or use a "Header and Footer Scripts" plugin.

**Squarespace**
Go to Settings > Advanced > Code Injection > Footer, and paste the script tag.

**Wix**
Go to Settings > Custom Code > Add Custom Code, paste the script, and set it to load in the Body (end).

**Plain HTML**
Add the <script> tag before </body> on each page.

Important:
- Do NOT modify any data- attribute values — they are configured for my specific business
- The widget renders a floating review button automatically — no extra CSS or HTML needed
- After adding it, visit your site and verify the widget appears in the bottom-right corner`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function WidgetInstallSection({
  mode,
  source,
  apiKey,
  projectName,
  businessType,
  businessName,
  categories,
  onCopy,
}: WidgetInstallSectionProps) {
  const [snippetCopied, setSnippetCopied] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);

  const isDev = mode === "developer";

  const snippet = isDev
    ? buildDevSnippet(source, apiKey)
    : buildBizSnippet(source, apiKey, businessType, businessName, categories);

  const aiPrompt = isDev
    ? buildDevPrompt(source, apiKey)
    : buildBizPrompt(source, apiKey, businessType, businessName, categories);

  function copySnippet() {
    navigator.clipboard.writeText(snippet).then(() => {
      setSnippetCopied(true);
      onCopy?.("Snippet copied");
      setTimeout(() => setSnippetCopied(false), 2000);
    });
  }

  function copyAiPrompt() {
    navigator.clipboard.writeText(aiPrompt).then(() => {
      setPromptCopied(true);
      onCopy?.("AI prompt copied");
      setTimeout(() => setPromptCopied(false), 2000);
    });
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-6 max-md:p-4 [html[data-theme=light]_&]:bg-white">
      {/* ── Header ── */}
      <div className="mb-5">
        <h3 className="font-serif text-callout text-text mb-1">Install Widget</h3>
        <p className="font-mono text-micro text-text3 leading-[1.6] max-w-[440px]">
          {isDev
            ? "Add the feedback widget to your app with a single script tag."
            : "Add the review widget to your website with a single script tag."}
        </p>
      </div>

      {/* ── Embed Snippet ── */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-micro text-text3 uppercase tracking-[0.08em]">
            Embed Snippet
          </span>
          <button
            onClick={copySnippet}
            className="flex items-center gap-1.5 font-mono text-footnote text-accent hover:text-accent/80
                       transition-colors cursor-pointer px-2.5 py-1 rounded
                       hover:bg-accent/5 border border-transparent hover:border-accent/20"
          >
            {snippetCopied ? (
              <>
                <CheckIcon />
                <span>Copied</span>
              </>
            ) : (
              <>
                <CopyIcon />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
        <pre
          className="bg-bg2 border border-border rounded-lg p-4 font-mono text-footnote text-text2
                     leading-[1.8] overflow-x-auto whitespace-pre-wrap select-all"
        >
          {snippet}
        </pre>
      </div>

      {/* ── Quick Start Steps ── */}
      <div className="mb-5">
        <span className="block font-mono text-micro text-text3 uppercase tracking-[0.08em] mb-2">
          Quick Start
        </span>
        <ol className="list-decimal list-inside flex flex-col gap-1.5 font-mono text-footnote text-text2 leading-[1.7]">
          <li>Copy the snippet above.</li>
          <li>
            Paste before the closing{" "}
            <code className="text-accent">&lt;/body&gt;</code> tag, or into your
            layout file.
          </li>
          <li>Deploy — the widget appears automatically.</li>
        </ol>
        <p className="font-mono text-micro text-text3 mt-2">
          {isDev
            ? "Works with React, Next.js, Vue, Svelte, or plain HTML."
            : "Works with Squarespace, WordPress, Wix, or plain HTML."}
        </p>
      </div>

      {/* ── AI-Assisted Install ── */}
      <div className="border-t border-border pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <SparklesIcon />
              <span className="font-mono text-micro text-text3 uppercase tracking-[0.08em]">
                AI-Assisted Install
              </span>
            </div>
            <p className="font-mono text-micro text-text3 leading-[1.6]">
              Paste this prompt into Claude Code or Cursor to auto-install the
              widget in your project.
            </p>
          </div>
          <button
            onClick={copyAiPrompt}
            className="flex items-center gap-1.5 font-mono text-footnote text-bg
                       bg-accent hover:bg-accent/90 transition-colors cursor-pointer
                       px-3 py-1.5 rounded-lg shrink-0"
          >
            {promptCopied ? (
              <>
                <CheckIcon />
                <span>Copied</span>
              </>
            ) : (
              <>
                <CopyIcon />
                <span>Copy AI Prompt</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
