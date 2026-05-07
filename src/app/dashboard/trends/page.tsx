"use client";

import { useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useProjectStore } from "@/stores/project-store";
import { useBizStore } from "@/stores/biz-store";
import { buildWeeklyData } from "@/lib/biz-helpers";
import { TrendChart } from "@/components/dashboard/biz/trend-chart";
import { TrendTable } from "@/components/dashboard/biz/trend-table";
import { EmptyStatePreview } from "@/components/ui/empty-state-preview";
import { Skeleton } from "@/components/ui/skeleton";
import { DEMO_BIZ_PENDING } from "@/lib/demo-data";

export default function TrendsPage() {
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
        <Skeleton className="h-[200px]" />
        <Skeleton className="h-[120px]" />
      </div>
    );
  }

  if (items.length === 0 && loaded) {
    return (
      <EmptyStatePreview
        kind="trend"
        heading="No trend data yet"
        description="Charts will appear once there's enough feedback to find patterns in."
        action={{ label: "Install widget", href: "/dashboard/setup" }}
        previewItems={DEMO_BIZ_PENDING}
        previewLimit={3}
      />
    );
  }

  const { byWeek, weeks, cats } = buildWeeklyData(items);

  return (
    <div>
      <span className="block font-mono text-footnote text-text3 uppercase tracking-[0.14em] mb-4">
        Weekly message volume
      </span>
      <TrendChart byWeek={byWeek} weeks={weeks} cats={cats} />
      <TrendTable byWeek={byWeek} weeks={weeks} cats={cats} />
    </div>
  );
}
