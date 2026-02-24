import type { FeedbackItem } from "@/types/feedback";

/** ISO 8601 week string (e.g., "2026-W08") */
export function isoWeek(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() + 4 - day);
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const wk = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + 1) / 7);
  return d.getFullYear() + "-W" + String(wk).padStart(2, "0");
}

/** Convert ISO week to readable date label (e.g., "Feb 3") */
export function weekLabel(isoWeekStr: string): string {
  const parts = isoWeekStr.split("-W");
  const jan4 = new Date(parseInt(parts[0]), 0, 4);
  const start = new Date(jan4);
  start.setDate(
    jan4.getDate() - jan4.getDay() + (parseInt(parts[1]) - 1) * 7
  );
  return start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Trend arrow direction based on this week vs last week */
export function trendArrow(
  thisWk: number,
  lastWk: number
): { sym: string; cls: "trend-up" | "trend-down" | "trend-steady"; note?: string } {
  if (lastWk === 0 && thisWk === 0)
    return { sym: "—", cls: "trend-steady" };
  if (lastWk === 0)
    return { sym: "↑", cls: "trend-up", note: "first time" };
  const delta = (thisWk - lastWk) / lastWk;
  if (delta > 0.15) return { sym: "↑", cls: "trend-up" };
  if (delta < -0.15) return { sym: "↓", cls: "trend-down" };
  return { sym: "→", cls: "trend-steady" };
}

/** Build weekly aggregation data for chart/table */
export function buildWeeklyData(items: FeedbackItem[]) {
  const byWeek = new Map<string, Map<string, number>>();
  items.forEach((item) => {
    const wk = isoWeek(item.created_at);
    const cat = item.type || "Other";
    if (!byWeek.has(wk)) byWeek.set(wk, new Map());
    const wm = byWeek.get(wk)!;
    wm.set(cat, (wm.get(cat) || 0) + 1);
  });
  const weeks = [...byWeek.keys()].sort().slice(-8);
  const cats = [...new Set(items.map((i) => i.type).filter(Boolean))] as string[];
  return { byWeek, weeks, cats };
}

/** Get items from this week and last week */
function thisAndLastWeekItems(items: FeedbackItem[]) {
  const now = new Date();
  const currentWeek = isoWeek(now.toISOString());

  // Calculate last week
  const lastWeekDate = new Date(now);
  lastWeekDate.setDate(lastWeekDate.getDate() - 7);
  const lastWeekStr = isoWeek(lastWeekDate.toISOString());

  const thisWeek = items.filter(
    (i) => isoWeek(i.created_at) === currentWeek
  );
  const lastWeek = items.filter(
    (i) => isoWeek(i.created_at) === lastWeekStr
  );
  return { thisWeek, lastWeek };
}

/** Build natural language insight lines */
export function buildInsightLines(items: FeedbackItem[]): string[] {
  const { thisWeek, lastWeek } = thisAndLastWeekItems(items);
  const lines: string[] = [];

  if (thisWeek.length === 0) {
    lines.push("No messages received this week yet.");
    if (items.length === 0) {
      lines.push(
        "Submit your first feedback using the widget on your website."
      );
    }
    return lines;
  }

  lines.push(
    `${thisWeek.length} customer message${thisWeek.length === 1 ? "" : "s"} this week.`
  );

  const catCounts: Record<string, number> = {};
  thisWeek.forEach((i) => {
    if (i.type) catCounts[i.type] = (catCounts[i.type] || 0) + 1;
  });
  const top = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0];
  if (top) {
    const lastCnt = lastWeek.filter((i) => i.type === top[0]).length;
    const tr = trendArrow(top[1], lastCnt);
    const trendTxt =
      tr.cls === "trend-up"
        ? " That's up from last week."
        : tr.cls === "trend-down"
          ? " That's down from last week."
          : "";
    lines.push(
      `${top[1]} ${top[1] === 1 ? "message" : "messages"} about ${top[0].toLowerCase()}.${trendTxt}`
    );
  }

  const needsReply = thisWeek.filter(
    (i) => i.triage?.suggested_reply && i.status === "pending"
  );
  if (needsReply.length) {
    lines.push(
      `${needsReply.length} message${needsReply.length === 1 ? "" : "s"} might need a reply from you.`
    );
  }

  return lines;
}

/** Chart colors for categories */
export const CHART_COLORS = [
  "#00c87a",
  "#e8640a",
  "#3b82f6",
  "#ec4899",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#6366f1",
];
