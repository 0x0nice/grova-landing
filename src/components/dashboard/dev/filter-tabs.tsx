"use client";

import type { FeedbackItem } from "@/types/feedback";

type Filter = "all" | "bug" | "feature" | "ux" | "spam";

interface FilterTabsProps {
  items: FeedbackItem[];
  active: Filter;
  onChange: (filter: Filter) => void;
}

const filters: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "bug", label: "Bug" },
  { key: "feature", label: "Feature" },
  { key: "ux", label: "UX" },
  { key: "spam", label: "Spam" },
];

function countFor(items: FeedbackItem[], filter: Filter): number {
  if (filter === "all") return items.length;
  if (filter === "spam") {
    return items.filter((i) => i.triage?.category === "spam").length;
  }
  return items.filter((i) => i.type === filter).length;
}

export function FilterTabs({ items, active, onChange }: FilterTabsProps) {
  return (
    <div className="flex items-center gap-1 mb-4 overflow-x-auto scrollbar-none" role="tablist">
      {filters.map((f) => {
        const count = countFor(items, f.key);
        const isActive = active === f.key;
        return (
          <button
            key={f.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(f.key)}
            className={`
              font-mono text-footnote uppercase tracking-[0.04em]
              px-3 py-1.5 rounded transition-colors duration-[180ms] cursor-pointer
              ${
                isActive
                  ? "bg-accent/10 text-accent border border-accent/20"
                  : "text-text3 hover:text-text2 border border-transparent"
              }
            `}
          >
            {f.label}
            <span className="ml-1.5 text-text3">{count}</span>
          </button>
        );
      })}
    </div>
  );
}
