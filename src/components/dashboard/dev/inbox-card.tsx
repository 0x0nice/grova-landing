"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { FeedbackItem } from "@/types/feedback";
import {
  effectiveScore,
  score as baseScore,
  signalCount,
  scoreAnchor,
  scoreClass,
  timeAgo,
} from "@/lib/triage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreDisplay } from "./score-display";
import { SubScoreGrid } from "./sub-score-grid";
import { EnrichmentPanel } from "./enrichment-panel";
import { ActionCard } from "./action-card";

interface InboxCardProps {
  item: FeedbackItem;
  onApprove: (id: string) => void;
  onDeny: (id: string) => void;
}

export function InboxCard({ item, onApprove, onDeny }: InboxCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [exiting, setExiting] = useState<"approve" | "deny" | null>(null);

  const es = effectiveScore(item);
  const base = baseScore(item);
  const sig = signalCount(item);
  const cls = scoreClass(es);
  const anchor = scoreAnchor(es);
  const t = item.triage;

  function handleAction(action: "approve" | "deny") {
    setExiting(action);
    setTimeout(() => {
      if (action === "approve") onApprove(item.id);
      else onDeny(item.id);
    }, 320);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 1, x: 0 }}
      animate={
        exiting
          ? { opacity: 0, x: exiting === "approve" ? 10 : -10 }
          : { opacity: 1, x: 0 }
      }
      transition={{ duration: 0.32 }}
      className="bg-surface border border-border rounded overflow-hidden [html[data-theme=light]_&]:bg-white"
    >
      {/* Main row */}
      <div className="grid grid-cols-[64px_1fr_auto] gap-4 p-4 max-md:grid-cols-[40px_1fr] max-md:gap-3">
        {/* Score */}
        <div className="flex justify-center pt-1">
          <ScoreDisplay score={es} size="lg" />
        </div>

        {/* Body */}
        <div className="min-w-0">
          {/* Meta row */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge type={t?.category || item.type} />
            {sig > 1 && (
              <span className="font-mono text-micro text-accent bg-accent/10 px-2 py-0.5 rounded">
                ↑ {sig} signals
              </span>
            )}
            {item.page && (
              <span
                className="font-mono text-micro text-text3 truncate max-w-[200px]"
                title={item.page}
              >
                {item.page}
              </span>
            )}
            <span className="font-mono text-micro text-text3">
              {timeAgo(item.created_at)}
            </span>
          </div>

          {/* Message */}
          <p className="font-mono text-callout text-text2 leading-[1.7] mb-2">
            {item.message}
          </p>

          {/* Expand toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="font-mono text-micro text-text3 hover:text-text2
                       transition-colors cursor-pointer flex items-center gap-1"
          >
            <span
              className={`transition-transform duration-[180ms] inline-block ${
                expanded ? "rotate-180" : ""
              }`}
            >
              ▼
            </span>
            {expanded ? "hide" : "details"}
          </button>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 shrink-0 max-md:col-span-2 max-md:flex-row">
          <Button
            variant="approve"
            onClick={() => handleAction("approve")}
            className="text-footnote px-4 py-2"
          >
            Approve
          </Button>
          <Button
            variant="deny"
            onClick={() => handleAction("deny")}
            className="text-footnote px-4 py-2"
          >
            Deny
          </Button>
        </div>
      </div>

      {/* Expanded detail panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border p-5 flex flex-col gap-5">
              {/* Score anchor */}
              <div className="flex items-center gap-3">
                <span
                  className={`font-mono text-footnote uppercase tracking-[0.04em] ${
                    cls === "high"
                      ? "text-red"
                      : cls === "mid"
                        ? "text-orange"
                        : "text-text3"
                  }`}
                >
                  {anchor}
                </span>
                {sig > 1 && (
                  <span className="font-mono text-micro text-text3">
                    Base {base.toFixed(1)} + {sig - 1} signal
                    {sig - 1 > 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {/* AI Summary */}
              {t?.summary && (
                <div>
                  <span className="block font-mono text-micro text-text3 uppercase tracking-[0.12em] mb-1.5">
                    Summary
                  </span>
                  <p className="font-mono text-footnote text-text2 leading-[1.7]">
                    {t.summary}
                  </p>
                </div>
              )}

              {/* Reasoning */}
              {t?.reasoning && (
                <div>
                  <span className="block font-mono text-micro text-text3 uppercase tracking-[0.12em] mb-1.5">
                    Analysis
                  </span>
                  <p className="font-mono text-footnote text-text2 leading-[1.7]">
                    {t.reasoning}
                  </p>
                </div>
              )}

              {/* Sub-scores */}
              {t?.sub_scores && (
                <div>
                  <span className="block font-mono text-micro text-text3 uppercase tracking-[0.12em] mb-2.5">
                    Score breakdown
                  </span>
                  <SubScoreGrid subScores={t.sub_scores} />
                </div>
              )}

              {/* Enrichment */}
              <EnrichmentPanel
                metadata={item.metadata}
                consoleErrors={item.console_errors}
                screenshot={item.screenshot}
              />

              {/* Suggested actions */}
              {t?.suggested_actions && t.suggested_actions.length > 0 && (
                <div>
                  <span className="block font-mono text-micro text-text3 uppercase tracking-[0.12em] mb-2.5">
                    Suggested actions
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {t.suggested_actions.map((action, i) => (
                      <ActionCard key={i} action={action} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
