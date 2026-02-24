"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { FeedbackItem } from "@/types/feedback";
import { effectiveScore, signalCount, timeAgo } from "@/lib/triage";
import { generateCursorPrompt } from "@/lib/cursor-prompt";
import { Badge } from "@/components/ui/badge";
import { ScoreDisplay } from "./score-display";
import { useToast } from "@/components/ui/toast";

interface DoneCardProps {
  item: FeedbackItem;
  projectContext?: string;
}

export function DoneCard({ item, projectContext }: DoneCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const { show } = useToast();

  const es = effectiveScore(item);
  const sig = signalCount(item);
  const t = item.triage;
  const prompt = generateCursorPrompt(item, projectContext);

  function handleCopy() {
    navigator.clipboard.writeText(prompt).then(() => {
      setCopied(true);
      show("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="bg-surface border border-border rounded overflow-hidden [html[data-theme=light]_&]:bg-white">
      {/* Main row */}
      <div className="grid grid-cols-[64px_1fr] gap-4 p-4 max-md:grid-cols-[40px_1fr] max-md:gap-3">
        <div className="flex justify-center pt-1">
          <ScoreDisplay score={es} size="sm" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge type={t?.category || item.type} />
            {sig > 1 && (
              <span className="font-mono text-micro text-accent bg-accent/10 px-2 py-0.5 rounded">
                ↑ {sig} signals
              </span>
            )}
            <span className="font-mono text-micro text-text3">
              {timeAgo(item.created_at)}
            </span>
          </div>
          <p className="font-mono text-callout text-text2 leading-[1.7] mb-2">
            {item.message}
          </p>

          {/* Prompt toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="font-mono text-micro text-accent hover:text-accent/80
                       transition-colors cursor-pointer flex items-center gap-1"
          >
            <span
              className={`transition-transform duration-[180ms] inline-block ${
                expanded ? "rotate-180" : ""
              }`}
            >
              ▼
            </span>
            Cursor prompt ready
          </button>
        </div>
      </div>

      {/* Cursor prompt block */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-micro text-text3 uppercase tracking-[0.12em]">
                  Generated prompt
                </span>
                <button
                  onClick={handleCopy}
                  className="font-mono text-micro text-accent hover:text-accent/80
                             transition-colors cursor-pointer"
                >
                  {copied ? "Copied!" : "Copy prompt"}
                </button>
              </div>
              <pre className="bg-bg2 border border-border rounded p-4 font-mono text-micro text-text2 leading-[1.8] overflow-x-auto whitespace-pre-wrap">
                {prompt}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
