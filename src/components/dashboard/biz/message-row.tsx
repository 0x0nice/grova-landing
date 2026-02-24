"use client";

import { useState } from "react";
import type { FeedbackItem } from "@/types/feedback";
import { scoreClass, scoreColor, timeAgo } from "@/lib/triage";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

interface MessageRowProps {
  item: FeedbackItem;
  showScore?: boolean;
}

export function MessageRow({ item, showScore = false }: MessageRowProps) {
  const [replyOpen, setReplyOpen] = useState(false);
  const { show } = useToast();
  const t = item.triage;
  const hasReply = !!t?.suggested_reply;

  function handleCopyReply() {
    if (t?.suggested_reply) {
      navigator.clipboard.writeText(t.suggested_reply).then(() => {
        show("Reply copied");
      });
    }
  }

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
        </div>
      </div>
    </div>
  );
}
