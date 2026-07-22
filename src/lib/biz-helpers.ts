import type { FeedbackItem } from "@/types/feedback";

/** Business reporting follows the AI triage category, with intake type only as fallback. */
export function feedbackCategory(item: FeedbackItem): string {
  const value = item.triage?.category?.trim() || item.type?.trim() || "Other";
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

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
    return { sym: "-", cls: "trend-steady" };
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
    const cat = feedbackCategory(item);
    if (!byWeek.has(wk)) byWeek.set(wk, new Map());
    const wm = byWeek.get(wk)!;
    wm.set(cat, (wm.get(cat) || 0) + 1);
  });
  const weeks = [...byWeek.keys()].sort().slice(-8);
  const cats = [...new Set(items.map(feedbackCategory))];
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

export interface InsightEvidence {
  thisWeekCount: number;
  totalCount: number;
  sinceLastVisit?: { count: number; label: string };
  topTheme?: {
    category: string;
    count: number;
    quote?: string;
    trend: "up" | "down" | "steady" | "new";
  };
  needsReply?: number;
}

/** Build evidence for the InsightProse component - specific facts, not pre-baked sentences. */
export function buildInsightEvidence(
  items: FeedbackItem[],
  opts?: { previousVisit?: Date | null; sinceLabel?: string }
): InsightEvidence {
  const { thisWeek, lastWeek } = thisAndLastWeekItems(items);

  const evidence: InsightEvidence = {
    thisWeekCount: thisWeek.length,
    totalCount: items.length,
  };

  if (opts?.previousVisit && opts?.sinceLabel) {
    const cutoff = opts.previousVisit.getTime();
    const count = items.filter(
      (i) => new Date(i.created_at).getTime() > cutoff
    ).length;
    if (count > 0) {
      evidence.sinceLastVisit = { count, label: opts.sinceLabel };
    }
  }

  // Top theme - pick from this-week if available, else from full set
  const sourceForTheme = thisWeek.length > 0 ? thisWeek : items;
  const catCounts: Record<string, number> = {};
  sourceForTheme.forEach((i) => {
    const category = feedbackCategory(i);
    catCounts[category] = (catCounts[category] || 0) + 1;
  });
  const top = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0];
  if (top) {
    const [category, count] = top;
    const lastCnt = lastWeek.filter((i) => feedbackCategory(i) === category).length;
    const trArrow = trendArrow(count, lastCnt);
    const trend: InsightEvidence["topTheme"] extends infer T
      ? T extends { trend: infer U }
        ? U
        : never
      : never =
      lastCnt === 0 && count > 0
        ? "new"
        : trArrow.cls === "trend-up"
          ? "up"
          : trArrow.cls === "trend-down"
            ? "down"
            : "steady";

    // Pick a representative quote - shortest message in the cluster (most quotable).
    const themeItems = sourceForTheme
      .filter((i) => feedbackCategory(i) === category)
      .filter((i) => i.message && i.message.length > 0)
      .sort((a, b) => a.message.length - b.message.length);
    const quote = themeItems[0]?.message;

    evidence.topTheme = { category, count, quote, trend };
  }

  const needsReply = items.filter(
    (i) => i.triage?.suggested_reply && i.status === "pending"
  ).length;
  if (needsReply > 0) evidence.needsReply = needsReply;

  return evidence;
}

/** Chart colors for categories */
export const CHART_COLORS = [
  "#3f7556",
  "#e8640a",
  "#3b82f6",
  "#ec4899",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#6366f1",
];
