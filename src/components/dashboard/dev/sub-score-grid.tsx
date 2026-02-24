import type { SubScores } from "@/types/feedback";
import { barColor, dimLabel } from "@/lib/triage";

interface SubScoreGridProps {
  subScores: SubScores;
}

export function SubScoreGrid({ subScores }: SubScoreGridProps) {
  const entries = Object.entries(subScores)
    .filter(([, v]) => typeof v === "number")
    .sort(([, a], [, b]) => (b as number) - (a as number));

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 max-md:grid-cols-1">
      {entries.map(([key, value]) => {
        const v = value as number;
        return (
          <div key={key} className="flex items-center gap-3">
            <span className="font-mono text-micro text-text3 w-[140px] shrink-0 truncate">
              {dimLabel(key)}
            </span>
            <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${barColor(v)} transition-all duration-300`}
                style={{ width: `${v * 100}%` }}
              />
            </div>
            <span className="font-mono text-micro text-text2 w-8 text-right">
              {v.toFixed(2)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
