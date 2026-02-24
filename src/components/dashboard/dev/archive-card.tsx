"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { FeedbackItem } from "@/types/feedback";
import { effectiveScore, timeAgo } from "@/lib/triage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ArchiveCardProps {
  item: FeedbackItem;
  onRestore: (id: string) => void;
}

export function ArchiveCard({ item, onRestore }: ArchiveCardProps) {
  const [exiting, setExiting] = useState(false);
  const es = effectiveScore(item);
  const t = item.triage;

  function handleRestore() {
    setExiting(true);
    setTimeout(() => onRestore(item.id), 320);
  }

  return (
    <motion.div
      layout
      animate={exiting ? { opacity: 0, x: 10 } : { opacity: 1, x: 0 }}
      transition={{ duration: 0.32 }}
      className="bg-surface border border-border rounded p-4 opacity-60 hover:opacity-100
                 transition-opacity grid grid-cols-[40px_1fr_auto] gap-4 items-center
                 [html[data-theme=light]_&]:bg-white max-md:grid-cols-[40px_1fr] max-md:gap-3"
    >
      {/* Score */}
      <span className="font-serif text-[1.8rem] italic text-text3 leading-none text-center">
        {es.toFixed(1)}
      </span>

      {/* Body */}
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge type={t?.category || item.type} />
          <span className="font-mono text-micro text-text3">
            {timeAgo(item.created_at)}
          </span>
        </div>
        <p className="font-mono text-footnote text-text3 leading-[1.6] truncate">
          {t?.summary || item.message}
        </p>
      </div>

      {/* Restore */}
      <Button
        variant="restore"
        onClick={handleRestore}
        className="text-footnote px-4 py-2 max-md:col-span-2"
      >
        Restore
      </Button>
    </motion.div>
  );
}
