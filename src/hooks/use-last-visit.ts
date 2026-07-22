"use client";

import { useEffect, useRef, useState } from "react";

const KEY_PREFIX = "grova:last-visit:";

/**
 * Tracks the last time the user visited a dashboard surface for a given
 * project. On mount, reads the previously stored timestamp and writes
 * the current one. The previous value is what callers display
 * ("12 new since Tuesday"). Per-project so switching projects shows
 * an accurate per-project delta.
 *
 * Returns `previousVisit = null` on first visit (no prior record),
 * and on every subsequent mount reads-then-writes once. The captured
 * "previous" value remains stable across the component's lifetime.
 */
export function useLastVisit(projectId: string | null | undefined): {
  previousVisit: Date | null;
} {
  const [previousVisit, setPreviousVisit] = useState<Date | null>(null);
  const recordedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    if (recordedFor.current === projectId) return;
    recordedFor.current = projectId;

    const key = KEY_PREFIX + projectId;
    try {
      const stored = window.localStorage.getItem(key);
      const parsed = stored ? Number(stored) : NaN;
      // localStorage read deliberately happens in effect (client-only)
      // to avoid SSR hydration mismatch - matches the project pattern in
      // theme-provider and track-provider.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreviousVisit(Number.isFinite(parsed) ? new Date(parsed) : null);
      window.localStorage.setItem(key, String(Date.now()));
    } catch {
      // localStorage may be unavailable (Safari private mode, etc.) - silently skip.
    }
  }, [projectId]);

  return { previousVisit };
}

/**
 * Format a Date as a calm, human-readable "since" label.
 * Examples: "today", "yesterday", "Tuesday", "Mar 12".
 */
export function sinceLabel(d: Date | null): string | null {
  if (!d) return null;
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) return "today";

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate()
  ) {
    return "yesterday";
  }

  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays < 7) {
    return d.toLocaleDateString("en-US", { weekday: "long" });
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
