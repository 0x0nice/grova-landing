"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/providers/auth-provider";
import { useProjectStore } from "@/stores/project-store";
import type { EmailTemplate } from "@/lib/templates";
import { renderTemplate } from "@/lib/templates";
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
  const { show } = useToast();
  const { session, isDemo } = useAuth();
  const active = useProjectStore((s) => s.active);

  // Load action_settings and re-render template with business_name, review_url, etc.
  useEffect(() => {
    if (!open || !active) return;
    const token = session?.access_token || "";
    const loadSettings = async () => {
      try {
        const settings = isDemo
          ? (demoGet(`/projects/${active.id}/action-settings`) as Record<string, unknown>)
          : await getActionSettings(active.id, token);
        if (!settings) return;
        const merged: Record<string, string> = {
          business_name: (settings as Record<string, unknown>).owner_name as string || active.name || "",
          review_platform: (settings as Record<string, unknown>).preferred_review_platform as string || "Google",
          review_url: (settings as Record<string, unknown>).review_url as string || "",
          owner_name: (settings as Record<string, unknown>).owner_name as string || active.name || "",
          ...variables,
        };
        setSubject(renderTemplate(template.subject, merged));
        setBody(renderTemplate(template.body, merged));
      } catch {}
    };
    loadSettings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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
    <Modal open={open} onClose={onClose} title={template.name} maxWidth="560px">
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
        <div>
          <label className="block font-mono text-micro text-text3 uppercase tracking-[0.12em] mb-1.5">
            Body
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            className="w-full bg-bg2 border border-border rounded px-3 py-2
                       font-mono text-footnote text-text leading-[1.7]
                       focus:outline-none focus:border-accent transition-colors resize-y"
          />
        </div>

        {/* Error message */}
        {error && (
          <p className="font-mono text-micro text-red">{error}</p>
        )}

        <div className="flex items-center gap-3">
          <Button variant="restore" onClick={onClose}>
            Close
          </Button>
          <Button variant="copy" onClick={handleCopy}>
            Copy to clipboard
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
