"use client";

import { useState } from "react";
import type { SuggestedAction } from "@/types/feedback";
import { actionIcon } from "@/lib/triage";
import { getTemplate } from "@/lib/templates";
import { sendSuggestedAction } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/components/ui/toast";
import { ActionPreviewModal } from "./action-preview-modal";

interface ActionCardProps {
  action: SuggestedAction;
  actionIndex: number;
  feedbackId: string;
  customerEmail?: string;
  customerName?: string;
  onActionSent?: () => void;
}

export function ActionCard({
  action,
  actionIndex,
  feedbackId,
  customerEmail,
  customerName,
  onActionSent,
}: ActionCardProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [quickSending, setQuickSending] = useState(false);
  const [quickSent, setQuickSent] = useState(false);
  const { session } = useAuth();
  const { show } = useToast();
  const icon = actionIcon(action.type);
  const template = action.template_id ? getTemplate(action.template_id) : null;

  async function handleQuickSend() {
    if (action.requires_customer_email && !customerEmail) {
      setPreviewOpen(true);
      return;
    }
    setQuickSending(true);
    try {
      const token = session?.access_token || "";
      await sendSuggestedAction(feedbackId, actionIndex, token);
      setQuickSent(true);
      show("Action sent");
      onActionSent?.();
    } catch {
      setPreviewOpen(true); // Fall back to preview modal on error
    } finally {
      setQuickSending(false);
    }
  }

  return (
    <>
      <div className="bg-bg border border-border rounded p-4 flex flex-col gap-2 min-w-[200px] [html[data-theme=light]_&]:bg-surface">
        <div className="flex items-start gap-2">
          <span className="text-[1rem]">{icon}</span>
          <div className="flex-1 min-w-0">
            <p className="font-mono text-footnote text-text leading-[1.4] mb-1">
              {action.headline}
            </p>
            <span
              className={`font-mono text-micro ${
                action.confidence >= 0.8
                  ? "text-accent"
                  : action.confidence >= 0.5
                    ? "text-orange"
                    : "text-text3"
              }`}
            >
              {Math.round(action.confidence * 100)}% confident
            </span>
          </div>
        </div>
        {template && (
          <div className="flex items-center gap-0">
            <button
              onClick={() => setPreviewOpen(true)}
              className="font-mono text-micro text-accent hover:text-accent/80
                         transition-colors cursor-pointer text-left mt-1"
            >
              Preview email
            </button>
            {!quickSent ? (
              <button
                onClick={handleQuickSend}
                disabled={quickSending}
                className="font-mono text-micro text-text3 hover:text-accent
                           transition-colors cursor-pointer text-left mt-1 ml-3"
              >
                {quickSending ? "Sending..." : "Send now"}
              </button>
            ) : (
              <span className="font-mono text-micro text-accent ml-3 mt-1">
                Sent
              </span>
            )}
          </div>
        )}
      </div>

      {template && (
        <ActionPreviewModal
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          template={template}
          variables={action.template_variables || {}}
          feedbackId={feedbackId}
          actionType={action.type}
          templateId={action.template_id!}
          customerEmail={customerEmail}
          customerName={customerName}
          requiresCustomerEmail={action.requires_customer_email}
          onSent={onActionSent}
        />
      )}
    </>
  );
}
