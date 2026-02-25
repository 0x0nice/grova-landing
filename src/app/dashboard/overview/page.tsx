"use client";

import { useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useProjectStore } from "@/stores/project-store";
import { useBizStore } from "@/stores/biz-store";
import { isoWeek, buildInsightLines } from "@/lib/biz-helpers";
import { InsightCard } from "@/components/dashboard/biz/insight-card";
import { InsightProse } from "@/components/dashboard/biz/insight-prose";
import { MessageRow } from "@/components/dashboard/biz/message-row";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

export default function OverviewPage() {
  const { session, isDemo } = useAuth();
  const active = useProjectStore((s) => s.active);
  const { items, loading, loaded, loadFeedback } = useBizStore();

  useEffect(() => {
    if (active && (session?.access_token || isDemo) && !loaded) {
      loadFeedback(active.id, session?.access_token || "demo", isDemo);
    }
  }, [active, session?.access_token, isDemo, loaded, loadFeedback]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-4 gap-4 max-md:grid-cols-2">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  if (items.length === 0 && loaded) {
    return (
      <EmptyState
        icon="📊"
        heading="No feedback yet"
        description="Messages from customers will appear here once the widget is installed."
      />
    );
  }

  // Compute metrics
  const currentWeek = isoWeek(new Date().toISOString());
  const thisWeekItems = items.filter(
    (i) => isoWeek(i.created_at) === currentWeek
  );
  const now = new Date();
  const thisMonthItems = items.filter((i) => {
    const d = new Date(i.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  // Most common category this week
  const catCounts: Record<string, number> = {};
  thisWeekItems.forEach((i) => {
    if (i.type) catCounts[i.type] = (catCounts[i.type] || 0) + 1;
  });
  const topCat = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0];

  // Needs reply
  const needsReply = items.filter(
    (i) => i.triage?.suggested_reply && i.status === "pending"
  ).length;

  const insightLines = buildInsightLines(items);
  const recent = items.slice(0, 5);

  return (
    <div>
      {/* Metrics grid */}
      <div className="grid grid-cols-4 gap-4 mb-6 max-lg:grid-cols-2 max-md:grid-cols-1">
        <InsightCard
          label="This week"
          value={thisWeekItems.length}
          subtitle="messages"
        />
        <InsightCard
          label="Most common"
          value={topCat ? topCat[0] : "—"}
          subtitle={topCat ? `${topCat[1]} messages` : ""}
        />
        <InsightCard
          label="Need a reply"
          value={needsReply}
          subtitle="pending"
          highlight={needsReply > 0}
        />
        <InsightCard
          label="This month"
          value={thisMonthItems.length}
          subtitle="total"
        />
      </div>

      {/* Insight prose */}
      <InsightProse lines={insightLines} />

      {/* Recent messages */}
      {recent.length > 0 && (
        <div>
          <span className="block font-mono text-micro text-text3 uppercase tracking-[0.14em] mb-3">
            Recent messages
          </span>
          <div className="border border-border rounded overflow-hidden [html[data-theme=light]_&]:bg-white">
            {recent.map((item) => (
              <MessageRow key={item.id} item={item} showScore isDemo={isDemo} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
