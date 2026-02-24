import type { FeedbackItem } from "@/types/feedback";
import { effectiveScore, signalCount } from "@/lib/triage";

interface StatsBarProps {
  items: FeedbackItem[];
}

export function StatsBar({ items }: StatsBarProps) {
  if (items.length === 0) return null;

  const scores = items.map(effectiveScore);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const highest = Math.max(...scores);
  const multiSignal = items.filter((i) => signalCount(i) > 1).length;

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-5 py-3 border-b border-border">
      <Stat label="Pending" value={String(items.length)} />
      <Stat label="Avg score" value={avg.toFixed(1)} />
      <Stat label="Highest" value={highest.toFixed(1)} />
      <Stat label="Multi-signal" value={String(multiSignal)} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-mono text-micro text-text3 uppercase tracking-[0.08em]">
        {label}
      </span>
      <span className="font-serif text-callout text-text">{value}</span>
    </div>
  );
}
