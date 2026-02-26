"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useProjectStore } from "@/stores/project-store";
import { useBizStore, type BizConfig } from "@/stores/biz-store";
import { CAT_PRESETS } from "@/lib/cat-presets";
import { useToast } from "@/components/ui/toast";
import { FontSizeControl } from "@/components/ui/font-size-control";
import { QRCodeCanvas } from "qrcode.react";

/* ------------------------------------------------------------------ */
/*  Eyeball toggle icon                                                */
/* ------------------------------------------------------------------ */
function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Copy icon                                                          */
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

/* ------------------------------------------------------------------ */
/*  Section card wrapper                                               */
/* ------------------------------------------------------------------ */
function Section({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-surface border border-border rounded-xl p-6 max-md:p-4 [html[data-theme=light]_&]:bg-white ${className}`}
    >
      {children}
    </div>
  );
}

function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div>
        <h3 className="font-serif text-body text-text mb-1">{title}</h3>
        {description && (
          <p className="font-mono text-footnote text-text3 leading-[1.6] max-w-[440px]">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export function SetupView() {
  const active = useProjectStore((s) => s.active);
  const { config, loadConfig, saveConfig } = useBizStore();
  const { show } = useToast();
  const [newCat, setNewCat] = useState("");
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [keyVisible, setKeyVisible] = useState(false);
  const [keyCopied, setKeyCopied] = useState(false);
  const [snippetCopied, setSnippetCopied] = useState(false);
  const [qrLinkCopied, setQrLinkCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (active) loadConfig(active.id);
  }, [active, loadConfig]);

  const save = useCallback(
    (updated: BizConfig) => {
      if (active) saveConfig(active.id, updated);
    },
    [active, saveConfig]
  );

  function handleNameChange(name: string) {
    save({ ...config, name });
  }

  function handleTypeChange(type: string) {
    const cats = [...(CAT_PRESETS[type] || CAT_PRESETS.default)];
    save({ ...config, type, categories: cats });
  }

  function addCategory() {
    const val = newCat.trim();
    if (!val || config.categories.includes(val)) return;
    save({ ...config, categories: [...config.categories, val] });
    setNewCat("");
  }

  function removeCategory(idx: number) {
    const cats = [...config.categories];
    cats.splice(idx, 1);
    save({ ...config, categories: cats });
  }

  function resetCategories() {
    const cats = [...(CAT_PRESETS[config.type] || CAT_PRESETS.default)];
    save({ ...config, categories: cats });
    show("Categories reset");
  }

  function handleDragStart(idx: number) {
    setDragIdx(idx);
  }

  function handleDrop(targetIdx: number) {
    if (dragIdx === null || dragIdx === targetIdx) return;
    const cats = [...config.categories];
    const [moved] = cats.splice(dragIdx, 1);
    cats.splice(targetIdx, 0, moved);
    save({ ...config, categories: cats });
    setDragIdx(null);
  }

  function copyKey() {
    if (!active?.api_key) return;
    navigator.clipboard.writeText(active.api_key);
    setKeyCopied(true);
    show("API key copied");
    setTimeout(() => setKeyCopied(false), 2000);
  }

  // QR code feedback URL
  const feedbackUrl = active?.api_key
    ? `https://grova.dev/f?k=${active.api_key}`
    : "";

  function copyFeedbackLink() {
    if (!feedbackUrl) return;
    navigator.clipboard.writeText(feedbackUrl);
    setQrLinkCopied(true);
    show("Feedback link copied");
    setTimeout(() => setQrLinkCopied(false), 2000);
  }

  function downloadQr() {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${config.name || "grova"}-qr-code.png`;
    a.click();
    show("QR code downloaded");
  }

  // Build embed snippet
  const source = active?.source || "your-business-id";
  const catStr = config.categories.join(",");
  let snippet = `<script\n  src="https://grova.dev/grova-business-widget.js"\n  data-source="${source}"`;
  if (active?.api_key) {
    snippet += `\n  data-key="${active.api_key}"`;
  }
  if (config.type && config.type !== "default") {
    snippet += `\n  data-business-type="${config.type}"`;
  }
  if (config.name) {
    snippet += `\n  data-name="${config.name.replace(/"/g, "&quot;")}"`;
  }
  if (catStr) {
    snippet += `\n  data-categories="${catStr}"`;
  }
  snippet += `>\n</script>`;

  function copySnippet() {
    navigator.clipboard.writeText(snippet).then(() => {
      setSnippetCopied(true);
      show("Snippet copied");
      setTimeout(() => setSnippetCopied(false), 2000);
    });
  }

  if (!active) return null;

  const maskedKey = active.api_key
    ? active.api_key.slice(0, 3) + "•".repeat(20) + active.api_key.slice(-4)
    : "";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* ── Left column: Setup & Distribution ── */}
      <div className="flex flex-col gap-5">
        {/* ── API Key ── */}
        {active.api_key && (
          <Section>
            <SectionHeader
              title="API Key"
              description="Use this key to authenticate your widget. Keep it private."
            />
            <div className="flex items-center gap-2 bg-bg2 rounded-lg px-4 py-3 border border-border">
              <code className="font-mono text-footnote text-text2 flex-1 break-all select-all">
                {keyVisible ? active.api_key : maskedKey}
              </code>
              <button
                onClick={() => setKeyVisible(!keyVisible)}
                className="p-1.5 rounded-md text-text3 hover:text-text2 hover:bg-surface
                           transition-colors cursor-pointer shrink-0"
                title={keyVisible ? "Hide key" : "Show key"}
                aria-label={keyVisible ? "Hide API key" : "Show API key"}
              >
                <EyeIcon open={keyVisible} />
              </button>
              <button
                onClick={copyKey}
                className="p-1.5 rounded-md text-text3 hover:text-text2 hover:bg-surface
                           transition-colors cursor-pointer shrink-0"
                title="Copy key"
                aria-label="Copy API key"
              >
                {keyCopied ? <CheckIcon /> : <CopyIcon />}
              </button>
            </div>
          </Section>
        )}

        {/* ── QR Code ── */}
        {feedbackUrl && (
          <Section>
            <SectionHeader
              title="QR Code"
              description="Print this QR code so customers can leave feedback from their phone."
            />
            <div className="flex flex-col items-center gap-4">
              <div
                ref={qrRef}
                className="bg-white rounded-lg p-4"
              >
                <QRCodeCanvas
                  value={feedbackUrl}
                  size={200}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="M"
                  marginSize={2}
                />
              </div>
              <p className="font-mono text-footnote text-text3 break-all text-center max-w-[300px]">
                {feedbackUrl}
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={downloadQr}
                  className="flex items-center gap-1.5 font-mono text-footnote text-text2
                             hover:text-text transition-colors cursor-pointer px-3 py-2 rounded-lg
                             bg-bg2 border border-border hover:border-border2"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download PNG
                </button>
                <button
                  onClick={copyFeedbackLink}
                  className="flex items-center gap-1.5 font-mono text-footnote text-accent
                             hover:text-accent/80 transition-colors cursor-pointer px-3 py-2 rounded-lg
                             hover:bg-accent/5 border border-transparent hover:border-accent/20"
                >
                  {qrLinkCopied ? (
                    <>
                      <CheckIcon />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </Section>
        )}

        {/* ── Widget Preview ── */}
        <Section>
          <SectionHeader
            title="Widget Preview"
            description="This is roughly how the widget will look on your site."
          />
          <div
            className="bg-bg2 border border-border rounded-lg p-6
                       [html[data-theme=light]_&]:bg-surface"
          >
            <span className="block font-mono text-footnote text-text3 uppercase tracking-[0.12em] mb-2">
              Get in touch
            </span>
            <h3 className="font-serif text-callout text-text mb-4">
              {config.name
                ? `Leave a message for ${config.name}`
                : "How can we help?"}
            </h3>
            <div className="flex flex-col gap-2">
              {config.categories.map((cat) => (
                <div
                  key={cat}
                  className="bg-surface border border-border rounded-lg px-3 py-2
                             font-mono text-footnote text-text2
                             [html[data-theme=light]_&]:bg-white"
                >
                  {cat}
                </div>
              ))}
            </div>
          </div>
        </Section>
      </div>

      {/* ── Right column: Customization ── */}
      <div className="flex flex-col gap-5">
        {/* ── Business Profile ── */}
        <Section>
          <SectionHeader
            title="Business Profile"
            description="Basic info about your business. This is shown in the review widget."
          />
          <div className="flex flex-col gap-4">
            <Input
              id="biz-name"
              label="Business name"
              value={config.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Corner Bistro"
            />
            <Select
              id="biz-type"
              label="Business type"
              value={config.type}
              onChange={(e) => handleTypeChange(e.target.value)}
            >
              <option value="restaurant">Restaurant</option>
              <option value="salon">Salon / Spa</option>
              <option value="retail">Retail store</option>
              <option value="default">Other</option>
            </Select>
          </div>
        </Section>

        {/* ── Categories ── */}
        <Section>
          <SectionHeader
            title="Review Categories"
            description="Organize incoming feedback by topic. Drag to reorder."
            action={
              <button
                onClick={resetCategories}
                className="font-mono text-footnote text-text3 hover:text-text2
                           transition-colors cursor-pointer px-2 py-1 rounded
                           hover:bg-bg2 border border-transparent hover:border-border"
              >
                Reset defaults
              </button>
            }
          />

          {/* Category chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            {config.categories.map((cat, i) => (
              <div
                key={`${cat}-${i}`}
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(i)}
                className="group flex items-center gap-1.5 bg-bg2 border border-border rounded-lg px-3 py-1.5
                           font-mono text-footnote text-text2 cursor-grab active:cursor-grabbing
                           transition-all hover:border-border2
                           [html[data-theme=light]_&]:bg-surface"
              >
                <span className="select-none">{cat}</span>
                <button
                  onClick={() => removeCategory(i)}
                  className="text-text3 hover:text-red transition-colors cursor-pointer ml-0.5
                             opacity-60 group-hover:opacity-100"
                  aria-label={`Remove ${cat}`}
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Add category */}
          <div className="flex items-center gap-2">
            <input
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCategory()}
              placeholder="Add category..."
              className="flex-1 bg-bg2 border border-border rounded-lg px-3 py-2
                         font-mono text-footnote text-text placeholder:text-text3
                         focus:outline-none focus:border-accent transition-colors"
            />
            <button
              onClick={addCategory}
              disabled={!newCat.trim()}
              className="font-mono text-footnote text-accent hover:text-accent/80
                         transition-colors cursor-pointer px-3 py-2 rounded-lg
                         hover:bg-accent/5 disabled:opacity-30 disabled:cursor-default"
            >
              Add
            </button>
          </div>
        </Section>

        {/* ── Embed Snippet ── */}
        <Section>
          <SectionHeader
            title="Embed Snippet"
            description="Paste this into your website HTML to show the review widget."
            action={
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
            }
          />
          <pre
            className="bg-bg2 border border-border rounded-lg p-4 font-mono text-footnote text-text2
                       leading-[1.8] overflow-x-auto whitespace-pre-wrap select-all"
          >
            {snippet}
          </pre>
        </Section>
      </div>

      {/* ── Full width: Appearance ── */}
      <div className="lg:col-span-2">
        <Section>
          <SectionHeader
            title="Appearance"
            description="Adjust the text size across the entire dashboard."
          />
          <FontSizeControl />
        </Section>
      </div>
    </div>
  );
}
