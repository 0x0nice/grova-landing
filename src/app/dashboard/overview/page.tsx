"use client";

import { useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useProjectStore } from "@/stores/project-store";
import { useBizStore } from "@/stores/biz-store";
import { isoWeek, buildInsightEvidence } from "@/lib/biz-helpers";
import { InsightCard } from "@/components/dashboard/biz/insight-card";
import { InsightProse } from "@/components/dashboard/biz/insight-prose";
import { InboxCard } from "@/components/dashboard/dev/inbox-card";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { DashboardPulse } from "@/components/dashboard/dashboard-pulse";
import { EmptyStatePreview } from "@/components/ui/empty-state-preview";
import { Skeleton } from "@/components/ui/skeleton";
import { useLastVisit, sinceLabel } from "@/hooks/use-last-visit";
import { DEMO_BIZ_PENDING } from "@/lib/demo-data";

const HIGH_PRIORITY_THRESHOLD = 7;

export default function OverviewPage() {
  const { session, isDemo } = useAuth();
  const active = useProjectStore((s) => s.active);
  const { items, loading, loaded, loadFeedback, approve, deny } = useBizStore();
  const { previousVisit } = useLastVisit(active?.id ?? null);

  useEffect(() => {
    if (active && (session?.access_token || isDemo) && !loaded) {
      loadFeedback(active.id, session?.access_token || "demo", isDemo);
    }
  }, [active, session?.access_token, isDemo, loaded, loadFeedback]);

  if (loading) {
    return (
      <div>
        <DashboardHero title="Overview" />
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-4 gap-4 max-md:grid-cols-2">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0 && loaded) {
    return (
      <div>
        <DashboardHero
          title="Overview"
          subtitle="Your feedback stream is quiet."
        />
        <EmptyStatePreview
          kind="chart"
          heading="No feedback yet"
          description="Once your widget is live, Grova will group recurring themes, surface urgent issues, and tell you what needs your attention this week."
          action={{ label: "Install widget", href: "/dashboard/setup" }}
          previewItems={DEMO_BIZ_PENDING}
          previewLimit={3}
        />
      </div>
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
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  });

  const catCounts: Record<string, number> = {};
  thisWeekItems.forEach((i) => {
    if (i.type) catCounts[i.type] = (catCounts[i.type] || 0) + 1;
  });
  const topCat = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0];

  const needsReply = items.filter(
    (i) => i.triage?.suggested_reply && i.status === "pending"
  ).length;

  const visitLabel = sinceLabel(previousVisit);
  const evidence = buildInsightEvidence(items, {
    previousVisit,
    sinceLabel: visitLabel ?? undefined,
  });

  const heroSubtitle = evidence.sinceLastVisit
    ? `${evidence.sinceLastVisit.count} new since ${evidence.sinceLastVisit.label} · ${items.length} total`
    : `${thisWeekItems.length} this week · ${items.length} total`;

  const recent = items.slice(0, 5);

  return (
    <div>
      <DashboardHero title="Overview" subtitle={heroSubtitle} />

      <DashboardPulse
        items={items}
        previousVisit={previousVisit}
        highThreshold={HIGH_PRIORITY_THRESHOLD}
      />

      {/* Narrative first — small business owners read story before numbers. */}
      <InsightProse evidence={evidence} />

      {/* Metrics grid */}
      <div className="grid grid-cols-4 gap-4 mb-6 max-lg:grid-cols-2 max-md:grid-cols-1">
        <InsightCard
          label="This week"
          value={thisWeekItems.length}
          subtitle="messages"
        />
        <InsightCard
          label="Top theme"
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

      {/* Recent messages */}
      {recent.length > 0 && (
        <div>
          <span className="block font-mono text-micro text-text3 uppercase tracking-[0.14em] mb-3">
            Recent messages
          </span>
          <div className="flex flex-col gap-3">
            {recent.map((item) => (
              <InboxCard
                key={item.id}
                item={item}
                onApprove={(id) =>
                  approve(id, session?.access_token || "demo", isDemo)
                }
                onDeny={(id) =>
                  deny(id, session?.access_token || "demo", isDemo)
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
