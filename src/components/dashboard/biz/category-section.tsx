"use client";

import { useState } from "react";
import type { FeedbackItem } from "@/types/feedback";
import { MessageRow } from "./message-row";

interface CategorySectionProps {
  name: string;
  items: FeedbackItem[];
  defaultOpen?: boolean;
  isDemo?: boolean;
}

export function CategorySection({
  name,
  items,
  defaultOpen = false,
  isDemo = false,
}: CategorySectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-border rounded overflow-hidden mb-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4
                   bg-surface hover:bg-surface/80 transition-colors cursor-pointer
                   [html[data-theme=light]_&]:bg-white"
      >
        <div className="flex items-center gap-3">
          <span className="font-serif text-callout text-text">{name}</span>
          <span className="font-mono text-footnote text-text3">
            {items.length} message{items.length !== 1 ? "s" : ""}
          </span>
        </div>
        <span
          className={`text-text3 transition-transform duration-[180ms] ${
            open ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>

      {open && (
        <div className="border-t border-border px-5">
          {items.map((item) => (
            <MessageRow key={item.id} item={item} showScore isDemo={isDemo} />
          ))}
        </div>
      )}
    </div>
  );
}
