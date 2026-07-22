import type { FeedbackItem } from "@/types/feedback";
import { effectiveScore, scoreClass, timeAgo } from "@/lib/triage";

interface DecisionQueueProps {
  items: FeedbackItem[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function DecisionQueue({ items, selectedId, onSelect }: DecisionQueueProps) {
  return (
    <div className="border-y border-border" aria-label="Feedback decision queue">
      {items.map((item) => {
        const selected = item.id === selectedId;
        const score = effectiveScore(item);
        const category = item.triage?.category || item.type;
        const summary = item.triage?.summary || item.message;
        const scoreTone = scoreClass(score);

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            aria-pressed={selected}
            className={`w-full text-left px-4 py-4 border-b border-border last:border-b-0 transition-colors cursor-pointer ${
              selected ? "bg-surface text-text" : "bg-transparent hover:bg-surface/50 text-text2"
            }`}
          >
            <div className="flex items-baseline gap-3 mb-2">
              <span
                className={`font-serif text-title tabular-nums ${
                  scoreTone === "high" ? "text-red" : scoreTone === "mid" ? "text-orange" : "text-text2"
                }`}
              >
                {score.toFixed(1)}
              </span>
              <span className="text-footnote text-text2 capitalize truncate">{category}</span>
              <span className="ml-auto font-mono text-micro text-text3 shrink-0">
                {timeAgo(item.created_at)}
              </span>
            </div>
            <p className="text-callout leading-[1.5] line-clamp-2">{summary}</p>
          </button>
        );
      })}
    </div>
  );
}
