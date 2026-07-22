import type { FeedbackItem } from "@/types/feedback";
import { effectiveScore } from "@/lib/triage";
import { isoWeek } from "@/lib/biz-helpers";
import { sinceLabel } from "@/hooks/use-last-visit";

interface DashboardPulseProps {
  items: FeedbackItem[];
  previousVisit?: Date | null;
  /** effectiveScore threshold to count as "high priority". Default 7. */
  highThreshold?: number;
  className?: string;
}

interface Chip {
  label: string;
  value: string | number;
  emphasis?: boolean;
}

function ChipView({ label, value, emphasis }: Chip) {
  return (
    <div
      className={`inline-flex items-baseline gap-2 rounded-pill border px-3 py-1.5 bg-surface ${
        emphasis ? "border-accent/40" : "border-border"
      }`}
    >
      <span className="font-mono text-micro text-text3">
        {label}
      </span>
      <span
        className={`font-mono text-footnote tabular-nums ${
          emphasis ? "text-accent" : "text-text"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export function DashboardPulse({
  items,
  previousVisit,
  highThreshold = 7,
  className = "",
}: DashboardPulseProps) {
  const currentWeek = isoWeek(new Date().toISOString());
  const thisWeek = items.filter((i) => isoWeek(i.created_at) === currentWeek);

  const sinceVisit = previousVisit
    ? items.filter((i) => new Date(i.created_at).getTime() > previousVisit.getTime())
    : [];

  const catCounts: Record<string, number> = {};
  thisWeek.forEach((i) => {
    if (i.type) catCounts[i.type] = (catCounts[i.type] || 0) + 1;
  });
  const top = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0];

  const highPriority = items.filter((i) => effectiveScore(i) >= highThreshold);

  const chips: Chip[] = [];

  if (previousVisit && sinceVisit.length > 0) {
    const label = sinceLabel(previousVisit) || "last visit";
    chips.push({
      label: `since ${label}`,
      value: sinceVisit.length,
      emphasis: true,
    });
  }

  chips.push({ label: "this week", value: thisWeek.length });

  if (top) {
    chips.push({ label: "top", value: top[0] });
  }

  chips.push({
    label: "high priority",
    value: highPriority.length,
    emphasis: highPriority.length > 0,
  });

  if (chips.length === 0) return null;

  return (
    <div
      className={`flex flex-wrap items-center gap-2 mb-5 ${className}`}
      aria-label="Dashboard pulse"
    >
      {chips.map((c, i) => (
        <ChipView key={i} {...c} />
      ))}
    </div>
  );
}
