import { weekLabel, CHART_COLORS } from "@/lib/biz-helpers";

interface TrendChartProps {
  byWeek: Map<string, Map<string, number>>;
  weeks: string[];
  cats: string[];
}

export function TrendChart({ byWeek, weeks, cats }: TrendChartProps) {
  if (weeks.length === 0) return null;

  // Find max total for scaling
  let maxCount = 0;
  weeks.forEach((wk) => {
    const wm = byWeek.get(wk);
    if (wm) {
      let total = 0;
      wm.forEach((v) => (total += v));
      if (total > maxCount) maxCount = total;
    }
  });

  return (
    <div>
      {/* Chart */}
      <div className="flex items-end gap-3 h-[180px] mb-4 border-b border-border pb-3">
        {weeks.map((wk) => {
          const wm = byWeek.get(wk);
          let total = 0;
          wm?.forEach((v) => (total += v));
          const height = Math.max(4, Math.round((total / (maxCount || 1)) * 150));
          const label = weekLabel(wk);

          return (
            <div
              key={wk}
              className="flex-1 flex flex-col items-center gap-1"
            >
              <div
                className="w-full rounded-sm transition-all duration-300"
                style={{
                  height: `${height}px`,
                  backgroundColor: CHART_COLORS[0],
                }}
                title={`${label}: ${total} messages`}
              />
              <span className="font-mono text-micro text-text3">{label}</span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {cats.map((cat, i) => (
          <div key={cat} className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{
                backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
              }}
            />
            <span className="font-mono text-micro text-text3">{cat}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
