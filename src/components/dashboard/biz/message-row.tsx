"use client";

import { useState } from "react";
import type { FeedbackItem } from "@/types/feedback";
import { scoreClass, scoreColor, timeAgo } from "@/lib/triage";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { ActionCard } from "@/components/dashboard/dev/action-card";

interface MessageRowProps {
  item: FeedbackItem;
  showScore?: boolean;
  isDemo?: boolean;
  onApprove?: (id: string) => void;
  onDeny?: (id: string) => void;
}

export function MessageRow({ item, showScore = false, isDemo = false, onApprove, onDeny }: MessageRowProps) {
  const [replyOpen, setReplyOpen] = useState(false);
  const { show } = useToast();
  const t = item.triage;
  const hasReply = !!t?.suggested_reply;
  const hasActions = !!(t?.suggested_actions && t.suggested_actions.length > 0);

  function handleCopyReply() {
    if (t?.suggested_reply) {
      navigator.clipboard.writeText(t.suggested_reply).then(() => {
        show("Reply copied");
      });
    }
  }

  const isPending = item.status === "pending";

  return (
    <div className="border-b border-border last:border-b-0 py-4 px-1">
      <div className="flex items-start gap-4">
        {/* Score column */}
        {showScore && t?.score != null && (
          <div className="shrink-0 text-center w-10">
            <span
              className={`font-serif text-[1.4rem] italic leading-none ${scoreColor(scoreClass(t.score))}`}
            >
              {t.score.toFixed(1)}
            </span>
            <span className="block font-mono text-micro text-text3 mt-0.5">
              score
            </span>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <Badge type={item.type} />
            {item.email && (
              <span className="font-mono text-micro text-text3">
                {item.email}
              </span>
            )}
            <span className="font-mono text-micro text-text3">
              {timeAgo(item.created_at)}
            </span>
            {!isPending && (
              <span
                className={`font-mono text-micro uppercase tracking-[0.06em] px-2 py-0.5 rounded ${
                  item.status === "approved"
                    ? "bg-accent/10 text-accent"
                    : "bg-orange/10 text-orange"
                }`}
              >
                {item.status}
              </span>
            )}
          </div>

          <p className="font-mono text-footnote text-text2 leading-[1.7] mb-2">
            {item.message}
          </p>

          {/* Suggested reply toggle */}
          {hasReply && (
            <>
              <button
                onClick={() => setReplyOpen(!replyOpen)}
                className="font-mono text-micro text-accent hover:text-accent/80
                           transition-colors cursor-pointer"
              >
                💬 Suggested reply
              </button>
              {replyOpen && (
                <div className="mt-2 bg-bg2 border border-border rounded p-4 [html[data-theme=light]_&]:bg-surface">
                  <span className="block font-mono text-micro text-text3 uppercase tracking-[0.12em] mb-2">
                    Suggested reply
                  </span>
                  <p className="font-mono text-footnote text-text2 leading-[1.7] italic mb-3">
                    &ldquo;{t!.suggested_reply}&rdquo;
                  </p>
                  <button
                    onClick={handleCopyReply}
                    className="font-mono text-micro text-accent hover:text-accent/80
                               transition-colors cursor-pointer"
                  >
                    Copy reply
                  </button>
                </div>
              )}
            </>
          )}

          {/* Suggested actions */}
          {hasActions && (
            <div className="mt-2">
              <div className="flex flex-wrap gap-3">
                {t!.suggested_actions!.map((action, i) => (
                  <ActionCard
                    key={i}
                    action={action}
                    feedbackId={item.id}
                    customerEmail={item.email ?? undefined}
                    onActionSent={() => show("Email sent")}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Approve / Deny buttons */}
        {onApprove && onDeny && isPending && (
          <div className="flex flex-col gap-2 shrink-0 self-center">
            <button
              onClick={() => onApprove(item.id)}
              className="rounded px-3 py-1.5 font-mono text-micro font-medium uppercase tracking-[0.04em]
                         bg-accent-dim text-accent hover:bg-accent hover:text-black
                         transition-all duration-[180ms] cursor-pointer"
            >
              Approve
            </button>
            <button
              onClick={() => onDeny(item.id)}
              className="rounded px-3 py-1.5 font-mono text-micro font-medium uppercase tracking-[0.04em]
                         bg-orange-dim text-orange hover:bg-orange hover:text-white
                         transition-all duration-[180ms] cursor-pointer"
            >
              Deny
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
