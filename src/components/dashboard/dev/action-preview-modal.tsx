"use client";

import { useState, useEffect, useMemo } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/providers/auth-provider";
import { useProjectStore } from "@/stores/project-store";
import type { EmailTemplate } from "@/lib/templates";
import { renderTemplate } from "@/lib/templates";
import { renderEmailPreviewHtml } from "@/lib/email-renderer";
import { sendAction, getActionSettings } from "@/lib/api";
import { demoPost, demoGet } from "@/lib/demo-data";

interface ActionPreviewModalProps {
  open: boolean;
  onClose: () => void;
  template: EmailTemplate;
  variables: Record<string, string>;
  feedbackId: string;
  actionType: string;
  templateId: string;
  customerEmail?: string;
  customerName?: string;
  requiresCustomerEmail?: boolean;
  onSent?: () => void;
}

export function ActionPreviewModal({
  open,
  onClose,
  template,
  variables,
  feedbackId,
  actionType,
  templateId,
  customerEmail,
  customerName,
  requiresCustomerEmail,
  onSent,
}: ActionPreviewModalProps) {
  const [subject, setSubject] = useState(() =>
    renderTemplate(template.subject, variables)
  );
  const [body, setBody] = useState(() =>
    renderTemplate(template.body, variables)
  );
  const [emailTo, setEmailTo] = useState(customerEmail || "");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"preview" | "edit">("preview");
  const [brandColor, setBrandColor] = useState("#00c87a");
  const [logoUrl, setLogoUrl] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const { show } = useToast();
  const { session, isDemo } = useAuth();
  const active = useProjectStore((s) => s.active);

  // Load action_settings and re-render template with business_name, review_url, etc.
  useEffect(() => {
    if (!open || !active) return;
    setIsInternal(templateId === "escalation_internal");
    const token = session?.access_token || "";
    const loadSettings = async () => {
      try {
        const settings = isDemo
          ? (demoGet(`/projects/${active.id}/action-settings`) as Record<string, unknown>)
          : await getActionSettings(active.id, token);
        if (!settings) return;
        const s = settings as Record<string, unknown>;

        // Store settings for the preview renderer
        setBrandColor((s.brand_color as string) || "#00c87a");
        setLogoUrl((s.logo_url as string) || "");
        setOwnerName((s.owner_name as string) || active.name || "The Team");

        const merged: Record<string, string> = {
          customer_name: customerName || "there",
          business_name: (s.owner_name as string) || active.name || "",
          review_platform: (s.preferred_review_platform as string) || "Google",
          review_url: (s.review_url as string) || "",
          owner_name: (s.owner_name as string) || active.name || "",
          ...variables,
        };
        // Ensure customer_name from feedback metadata wins over triage defaults
        if (customerName && !variables.customer_name) {
          merged.customer_name = customerName;
        }
        setSubject(renderTemplate(template.subject, merged));
        setBody(renderTemplate(template.body, merged));
      } catch {}
    };
    loadSettings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Memoize the HTML preview so it only re-renders when body/subject/settings change
  const previewHtml = useMemo(
    () =>
      renderEmailPreviewHtml({
        body,
        subject,
        brandColor,
        logoUrl: logoUrl || undefined,
        ownerName,
        isInternal,
      }),
    [body, subject, brandColor, logoUrl, ownerName, isInternal]
  );

  function handleCopy() {
    const text = `Subject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(text).then(() => {
      show("Copied to clipboard");
    });
  }

  async function handleSend() {
    if (requiresCustomerEmail && !emailTo) {
      setError("Customer email is required to send this action.");
      return;
    }

    setSending(true);
    setError(null);

    try {
      if (isDemo) {
        demoPost("/actions/send");
      } else {
        const token = session?.access_token || "";
        await sendAction(
          {
            feedback_id: feedbackId,
            action_type: actionType,
            template_id: templateId,
            template_variables: variables,
            email_to: emailTo || undefined,
            subject,
            body,
          },
          token
        );
      }
      setSent(true);
      show("Email sent successfully");
      onSent?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send email");
    } finally {
      setSending(false);
    }
  }

  const needsEmailInput = requiresCustomerEmail && !customerEmail;

  return (
    <Modal open={open} onClose={onClose} title={template.name} maxWidth="640px">
      <div className="flex flex-col gap-4">
        {/* Recipient email — shown when feedback has no email */}
        {needsEmailInput && (
          <div>
            <label className="block font-mono text-micro text-text3 uppercase tracking-[0.12em] mb-1.5">
              Recipient email
            </label>
            <input
              type="email"
              value={emailTo}
              onChange={(e) => setEmailTo(e.target.value)}
              placeholder="customer@example.com"
              className="w-full bg-bg2 border border-border rounded px-3 py-2
                         font-mono text-footnote text-text
                         focus:outline-none focus:border-accent transition-colors"
            />
          </div>
        )}

        {/* Pre-filled email display */}
        {customerEmail && (
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-micro text-text3 uppercase tracking-[0.08em] shrink-0">
              To
            </span>
            <span className="font-mono text-footnote text-text2">
              {customerEmail}
            </span>
          </div>
        )}

        {/* Subject — always editable */}
        <div>
          <label className="block font-mono text-micro text-text3 uppercase tracking-[0.12em] mb-1.5">
            Subject
          </label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full bg-bg2 border border-border rounded px-3 py-2
                       font-mono text-footnote text-text
                       focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        {/* Preview / Edit toggle */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMode("preview")}
            className={`font-mono text-micro uppercase tracking-[0.08em] px-3 py-1.5 rounded transition-colors ${
              mode === "preview"
                ? "bg-accent/15 text-accent"
                : "text-text3 hover:text-text2"
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => setMode("edit")}
            className={`font-mono text-micro uppercase tracking-[0.08em] px-3 py-1.5 rounded transition-colors ${
              mode === "edit"
                ? "bg-accent/15 text-accent"
                : "text-text3 hover:text-text2"
            }`}
          >
            Edit
          </button>
        </div>

        {/* Body — preview iframe or edit textarea */}
        {mode === "preview" ? (
          <iframe
            srcDoc={previewHtml}
            sandbox="allow-same-origin"
            title="Email preview"
            className="w-full rounded border border-border bg-[#f8f8f6]"
            style={{ height: "420px" }}
          />
        ) : (
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={14}
            className="w-full bg-bg2 border border-border rounded px-3 py-2
                       font-mono text-footnote text-text leading-[1.7]
                       focus:outline-none focus:border-accent transition-colors resize-y"
          />
        )}

        {/* Error message */}
        {error && (
          <p className="font-mono text-micro text-red">{error}</p>
        )}

        <div className="flex items-center gap-3">
          <Button variant="restore" onClick={onClose}>
            Close
          </Button>
          <Button variant="copy" onClick={handleCopy}>
            Copy text
          </Button>
          {!sent ? (
            <Button
              variant="primary"
              onClick={handleSend}
              loading={sending}
              disabled={sending || (needsEmailInput && !emailTo)}
            >
              Send email
            </Button>
          ) : (
            <span className="font-mono text-footnote text-accent">
              Sent
            </span>
          )}
        </div>
      </div>
    </Modal>
  );
}
