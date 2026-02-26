"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { FeedbackItem, SentAction } from "@/types/feedback";
import {
  effectiveScore,
  score as baseScore,
  signalCount,
  scoreAnchor,
  scoreClass,
  timeAgo,
  actionIcon,
} from "@/lib/triage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreDisplay } from "./score-display";
import { SubScoreGrid } from "./sub-score-grid";
import { EnrichmentPanel } from "./enrichment-panel";
import { ActionCard } from "./action-card";
import { useAuth } from "@/providers/auth-provider";
import { getActions } from "@/lib/api";
import { demoGet } from "@/lib/demo-data";

interface InboxCardProps {
  item: FeedbackItem;
  onApprove: (id: string) => void;
  onDeny: (id: string) => void;
}

function ActionStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    sent: "bg-accent/10 text-accent",
    delivered: "bg-accent/10 text-accent",
    opened: "bg-accent/20 text-accent",
    clicked: "bg-accent/20 text-accent",
    draft: "bg-bg2 text-text3",
    queued: "bg-orange/10 text-orange",
    failed: "bg-red/10 text-red",
    bounced: "bg-red/10 text-red",
  };
  return (
    <span
      className={`font-mono text-micro uppercase tracking-[0.06em] px-2 py-0.5 rounded ${
        styles[status] || "bg-bg2 text-text3"
      }`}
    >
      {status}
    </span>
  );
}

export function InboxCard({ item, onApprove, onDeny }: InboxCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [exiting, setExiting] = useState<"approve" | "deny" | null>(null);
  const [sentActions, setSentActions] = useState<SentAction[]>([]);
  const [actionsLoaded, setActionsLoaded] = useState(false);
  const { session, isDemo } = useAuth();

  const es = effectiveScore(item);
  const base = baseScore(item);
  const sig = signalCount(item);
  const cls = scoreClass(es);
  const anchor = scoreAnchor(es);
  const t = item.triage;

  const loadActions = useCallback(() => {
    const token = session?.access_token || "";
    if (isDemo) {
      setSentActions(demoGet(`/actions?feedback_id=${item.id}`) as SentAction[]);
      setActionsLoaded(true);
    } else {
      getActions(item.id, token)
        .then((data) => {
          setSentActions(data);
          setActionsLoaded(true);
        })
        .catch(() => setActionsLoaded(true));
    }
  }, [item.id, session?.access_token, isDemo]);

  // Lazy-load action history when card is expanded
  useEffect(() => {
    if (expanded && !actionsLoaded) {
      loadActions();
    }
  }, [expanded, actionsLoaded, loadActions]);

  function handleAction(action: "approve" | "deny") {
    setExiting(action);
    setTimeout(() => {
      if (action === "approve") onApprove(item.id);
      else onDeny(item.id);
    }, 320);
  }

  function handleActionSent() {
    loadActions();
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
      <div className="grid grid-cols-[64px_1fr_auto] gap-4 p-4 max-md:grid-cols-[66px_1fr] max-md:gap-3 max-md:p-3">
        {/* Score + mobile actions (stacked) */}
        <div className="flex flex-col items-center gap-2 pt-1">
          {/* Score — lg on desktop, sm on mobile */}
          <div className="max-md:hidden">
            <ScoreDisplay score={es} size="lg" />
          </div>
          <div className="hidden max-md:block">
            <ScoreDisplay score={es} size="sm" />
          </div>

          {/* Mobile-only compact approve/deny under score */}
          <div className="hidden max-md:flex flex-col gap-1.5 w-full mt-1">
            <button
              onClick={() => handleAction("approve")}
              className="w-full rounded py-1.5 font-mono text-[0.54rem] font-medium uppercase tracking-[0.04em]
                         bg-accent-dim text-accent hover:bg-accent hover:text-black
                         transition-all duration-[180ms] cursor-pointer text-center"
            >
              Approve
            </button>
            <button
              onClick={() => handleAction("deny")}
              className="w-full rounded py-1.5 font-mono text-[0.54rem] font-medium uppercase tracking-[0.04em]
                         bg-orange-dim text-orange hover:bg-orange hover:text-white
                         transition-all duration-[180ms] cursor-pointer text-center"
            >
              Deny
            </button>
          </div>
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
                className="font-mono text-micro text-text3 truncate max-w-[200px] max-md:max-w-[120px]"
                title={item.page}
              >
                {item.page}
              </span>
            )}
            <span className="font-mono text-micro text-text3 ml-auto max-md:ml-0">
              {timeAgo(item.created_at)}
            </span>
          </div>

          {/* Message */}
          <p className="font-mono text-callout text-text2 leading-[1.7] mb-3">
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

        {/* Desktop-only actions column */}
        <div className="flex flex-col gap-2 shrink-0 max-md:hidden">
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
                      <ActionCard
                        key={i}
                        action={action}
                        feedbackId={item.id}
                        customerEmail={item.email}
                        customerName={(item.metadata as Record<string, unknown>)?.customer_name as string | undefined}
                        onActionSent={handleActionSent}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Action history */}
              {actionsLoaded && sentActions.length > 0 && (
                <div>
                  <span className="block font-mono text-micro text-text3 uppercase tracking-[0.12em] mb-2.5">
                    Action history
                  </span>
                  <div className="flex flex-col gap-2">
                    {sentActions.map((sa) => (
                      <div
                        key={sa.id}
                        className="flex items-center gap-3 bg-bg border border-border rounded px-3 py-2"
                      >
                        <span className="text-[0.85rem]">
                          {actionIcon(sa.action_type)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-micro text-text2 truncate">
                            {sa.email_subject}
                          </p>
                          <span className="font-mono text-micro text-text3">
                            {sa.email_to || "No recipient"} · {timeAgo(sa.created_at)}
                          </span>
                        </div>
                        <ActionStatusBadge status={sa.status} />
                      </div>
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
