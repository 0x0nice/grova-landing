import { trendArrow } from "@/lib/biz-helpers";

interface TrendTableProps {
  byWeek: Map<string, Map<string, number>>;
  weeks: string[];
  cats: string[];
}

export function TrendTable({ byWeek, weeks, cats }: TrendTableProps) {
  if (weeks.length < 1 || cats.length === 0) return null;

  const thisWeek = weeks[weeks.length - 1];
  const lastWeek = weeks.length >= 2 ? weeks[weeks.length - 2] : null;

  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full font-mono text-footnote">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left text-text3 text-micro uppercase tracking-[0.08em] py-2 pr-4">
              Category
            </th>
            <th className="text-right text-text3 text-micro uppercase tracking-[0.08em] py-2 px-4">
              This week
            </th>
            <th className="text-right text-text3 text-micro uppercase tracking-[0.08em] py-2 px-4">
              Last week
            </th>
            <th className="text-right text-text3 text-micro uppercase tracking-[0.08em] py-2 pl-4">
              Trend
            </th>
          </tr>
        </thead>
        <tbody>
          {cats.map((cat) => {
            const thisCount = byWeek.get(thisWeek)?.get(cat) || 0;
            const lastCount = lastWeek
              ? byWeek.get(lastWeek)?.get(cat) || 0
              : 0;
            const trend = trendArrow(thisCount, lastCount);

            return (
              <tr key={cat} className="border-b border-border/50">
                <td className="py-2.5 pr-4 text-text2">{cat}</td>
                <td className="py-2.5 px-4 text-right text-text">
                  {thisCount}
                </td>
                <td className="py-2.5 px-4 text-right text-text3">
                  {lastCount}
                </td>
                <td className="py-2.5 pl-4 text-right">
                  <span
                    className={`${
                      trend.cls === "trend-up"
                        ? "text-red"
                        : trend.cls === "trend-down"
                          ? "text-accent"
                          : "text-text3"
                    }`}
                  >
                    {trend.sym}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
