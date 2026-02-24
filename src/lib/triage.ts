import type { FeedbackItem } from "@/types/feedback";

/** Get base score from triage, falling back to 0 */
export function score(item: FeedbackItem): number {
  return item.triage?.score ?? 0;
}

/** Signal count (number of users reporting same issue) */
export function signalCount(item: FeedbackItem): number {
  return item.triage?.signal_count ?? 1;
}

/** Effective score with multi-signal boost (capped at 10) */
export function effectiveScore(item: FeedbackItem): number {
  const base = score(item);
  const sig = signalCount(item);
  if (sig <= 1) return base;
  return Math.min(10, +(base + Math.min((sig - 1) * 0.7, 3.5)).toFixed(1));
}

/** Score color class: high (8+), mid (5+), low (<5) */
export function scoreClass(s: number): "high" | "mid" | "low" {
  if (s >= 8) return "high";
  if (s >= 5) return "mid";
  return "low";
}

/** Score anchor label */
export function scoreAnchor(s: number): string {
  if (s >= 9) return "Drop everything";
  if (s >= 7) return "Prioritize this week";
  if (s >= 5) return "Worth reading";
  if (s >= 3) return "Background noise";
  return "Noise";
}

/** Color for a score class */
export function scoreColor(cls: "high" | "mid" | "low"): string {
  if (cls === "high") return "text-red";
  if (cls === "mid") return "text-orange";
  return "text-text3";
}

/** Bar color for sub-score value */
export function barColor(value: number): string {
  if (value >= 0.7) return "bg-red";
  if (value >= 0.4) return "bg-orange";
  return "bg-text3";
}

/** Format sub-score name from snake_case to readable label */
export function dimLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Action type to emoji icon mapping */
export function actionIcon(type: string): string {
  const map: Record<string, string> = {
    recovery_email: "🔄",
    thank_you_email: "⭐",
    review_redirect: "⭐",
    internal_flag: "🏷️",
    direct_reply: "💬",
    escalation_alert: "🚨",
    follow_up_reminder: "🔔",
    refund_suggestion: "💰",
    operational_change: "⚙️",
  };
  return map[type] || "📋";
}

/** Relative time from ISO date string */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

/** Feedback type label */
export function typeLabel(type: string): string {
  const map: Record<string, string> = {
    bug: "Bug",
    feature: "Feature",
    feature_request: "Feature",
    ux: "UX",
    spam: "Spam",
    other: "Other",
    complaint: "Complaint",
    praise: "Praise",
    question: "Question",
  };
  return map[type] || type;
}
