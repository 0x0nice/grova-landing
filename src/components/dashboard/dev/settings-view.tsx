"use client";

import { useEffect, useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/stores/project-store";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/providers/auth-provider";
import { getActionSettings, putActionSettings } from "@/lib/api";
import { demoGet } from "@/lib/demo-data";
import type { ActionSettings } from "@/types/feedback";
import { FontSizeControl } from "@/components/ui/font-size-control";
import { QRCodeCanvas } from "qrcode.react";

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
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
/*  Section helpers                                                    */
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
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5">
      <h3 className="font-serif text-callout text-text mb-1">{title}</h3>
      {description && (
        <p className="font-mono text-micro text-text3 leading-[1.6] max-w-[440px]">
          {description}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export function SettingsView() {
  const active = useProjectStore((s) => s.active);
  const [context, setContext] = useState("");
  const [saved, setSaved] = useState(false);
  const { show } = useToast();
  const { session, isDemo } = useAuth();

  // Action settings state
  const [actionSettings, setActionSettings] = useState<ActionSettings | null>(
    null
  );
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [keyVisible, setKeyVisible] = useState(false);
  const [keyCopied, setKeyCopied] = useState(false);
  const [qrLinkCopied, setQrLinkCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const storageKey = active ? `grova-ctx-${active.id}` : null;

  useEffect(() => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved) setContext(saved);
    }
  }, [storageKey]);

  // Load action settings when project changes
  useEffect(() => {
    if (!active) return;
    setSettingsLoading(true);
    const token = session?.access_token || "";
    if (isDemo) {
      setActionSettings(
        demoGet(`/projects/${active.id}/action-settings`) as ActionSettings
      );
      setSettingsLoading(false);
    } else {
      getActionSettings(active.id, token)
        .then(setActionSettings)
        .catch(() => {})
        .finally(() => setSettingsLoading(false));
    }
  }, [active, session?.access_token, isDemo]);

  function handleSave() {
    if (storageKey) {
      localStorage.setItem(storageKey, context);
      setSaved(true);
      show("Context saved");
      setTimeout(() => setSaved(false), 2000);
    }
  }

  async function handleSaveActionSettings() {
    if (!active || !actionSettings) return;
    setSettingsSaving(true);
    try {
      if (!isDemo) {
        const token = session?.access_token || "";
        const updated = await putActionSettings(active.id, actionSettings, token);
        setActionSettings(updated);
      }
      show("Action settings saved");
    } catch {
      show("Failed to save settings");
    } finally {
      setSettingsSaving(false);
    }
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
    a.download = `${active?.name || "grova"}-qr-code.png`;
    a.click();
    show("QR code downloaded");
  }

  if (!active) return null;

  const maskedKey = active.api_key
    ? active.api_key.slice(0, 3) + "•".repeat(20) + active.api_key.slice(-4)
    : "";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* ── Left column: Project & Distribution ── */}
      <div className="flex flex-col gap-5">
        {/* ── Project Info ── */}
        <Section>
          <SectionHeader title="Project Info" />
          <h2 className="font-serif text-title text-text mb-4">{active.name}</h2>
          <div className="flex flex-col gap-3">
            <InfoRow label="Source" value={active.source || "—"} />
            <InfoRow label="Mode" value={active.mode} />
          </div>

          {/* API Key — hidden by default */}
          {active.api_key && (
            <div className="mt-5 pt-5 border-t border-border">
              <label className="block font-mono text-footnote text-text3 uppercase tracking-[0.08em] mb-2">
                API Key
              </label>
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
            </div>
          )}
        </Section>

        {/* ── QR Code ── */}
        {feedbackUrl && (
          <Section>
            <SectionHeader
              title="QR Code"
              description="Print this QR code so customers can leave feedback from their phone."
            />
            <div className="flex flex-col items-center gap-4">
              <div ref={qrRef} className="bg-white rounded-lg p-4">
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
      </div>

      {/* ── Right column: Configuration ── */}
      <div className="flex flex-col gap-5">
        {/* ── Triage Lens ── */}
        <Section>
          <SectionHeader
            title="Triage Lens"
            description="Paste your README or product description. This context is injected into every Cursor prompt when you approve feedback."
          />
          <Textarea
            id="project-ctx"
            label="Project description / README"
            placeholder={"## My App\n\nA tool for indie developers…"}
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={8}
            maxLength={5000}
            charCount
          />
          <div className="mt-4">
            <Button variant="primary" onClick={handleSave}>
              {saved ? "Saved ✓" : "Save context"}
            </Button>
          </div>
        </Section>

        {/* ── Smart Actions ── */}
        <Section>
          <SectionHeader
            title="Smart Actions"
            description="Configure how outbound emails are sent from Smart Actions."
          />

          {settingsLoading ? (
            <div className="font-mono text-footnote text-text3">Loading...</div>
          ) : actionSettings ? (
            <div className="flex flex-col gap-4">
              <Input
                id="owner-name"
                label="From name"
                placeholder="Your name or business name"
                value={actionSettings.owner_name || ""}
                onChange={(e) =>
                  setActionSettings({
                    ...actionSettings,
                    owner_name: e.target.value,
                  })
                }
              />
              <Input
                id="reply-to"
                label="Reply-to email"
                type="email"
                placeholder="you@example.com"
                value={actionSettings.reply_to_email || ""}
                onChange={(e) =>
                  setActionSettings({
                    ...actionSettings,
                    reply_to_email: e.target.value,
                  })
                }
              />
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="brand-color"
                  className="font-mono text-footnote text-text2 uppercase tracking-[0.04em]"
                >
                  Brand color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="brand-color"
                    type="color"
                    value={actionSettings.brand_color || "#00c87a"}
                    onChange={(e) =>
                      setActionSettings({
                        ...actionSettings,
                        brand_color: e.target.value,
                      })
                    }
                    className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-transparent"
                  />
                  <span className="font-mono text-footnote text-text3">
                    {actionSettings.brand_color || "#00c87a"}
                  </span>
                </div>
              </div>
              <Input
                id="review-url"
                label="Review page URL"
                placeholder="https://g.page/your-business/review"
                value={actionSettings.review_url || ""}
                onChange={(e) =>
                  setActionSettings({
                    ...actionSettings,
                    review_url: e.target.value,
                  })
                }
              />
              <Input
                id="escalation-email"
                label="Escalation email"
                type="email"
                placeholder="manager@example.com"
                value={actionSettings.escalation_email || ""}
                onChange={(e) =>
                  setActionSettings({
                    ...actionSettings,
                    escalation_email: e.target.value,
                  })
                }
              />

              {/* Follow-up toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="follow-up-enabled"
                  checked={actionSettings.follow_up_enabled}
                  onChange={(e) =>
                    setActionSettings({
                      ...actionSettings,
                      follow_up_enabled: e.target.checked,
                    })
                  }
                  className="accent-accent w-4 h-4"
                />
                <label
                  htmlFor="follow-up-enabled"
                  className="font-mono text-footnote text-text2"
                >
                  Auto-schedule follow-up emails
                </label>
              </div>
              {actionSettings.follow_up_enabled && (
                <Input
                  id="follow-up-days"
                  label="Follow-up delay (days)"
                  type="number"
                  value={String(actionSettings.follow_up_delay_days)}
                  onChange={(e) =>
                    setActionSettings({
                      ...actionSettings,
                      follow_up_delay_days: parseInt(e.target.value) || 7,
                    })
                  }
                />
              )}

              <div className="mt-2">
                <Button
                  variant="primary"
                  onClick={handleSaveActionSettings}
                  loading={settingsSaving}
                >
                  Save settings
                </Button>
              </div>
            </div>
          ) : null}
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

/* ------------------------------------------------------------------ */
/*  Helper rows                                                        */
/* ------------------------------------------------------------------ */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="font-mono text-footnote text-text3 uppercase tracking-[0.08em] w-16 shrink-0">
        {label}
      </span>
      <span className="font-mono text-footnote text-text2">{value}</span>
    </div>
  );
}
