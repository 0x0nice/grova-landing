"use client";

import { useState } from "react";
import type { SuggestedAction } from "@/types/feedback";
import { actionIcon } from "@/lib/triage";
import { getTemplate } from "@/lib/templates";
import { ActionPreviewModal } from "./action-preview-modal";

interface ActionCardProps {
  action: SuggestedAction;
  feedbackId: string;
  customerEmail?: string;
  customerName?: string;
  onActionSent?: () => void;
}

export function ActionCard({
  action,
  feedbackId,
  customerEmail,
  customerName,
  onActionSent,
}: ActionCardProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const icon = actionIcon(action.type);
  const template = action.template_id ? getTemplate(action.template_id) : null;

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
              className={`font-mono text-micro uppercase tracking-[0.08em] ${
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
          <button
            onClick={() => setPreviewOpen(true)}
            className="font-mono text-micro text-accent hover:text-accent/80
                       transition-colors cursor-pointer text-left mt-1"
          >
            Preview email
          </button>
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
