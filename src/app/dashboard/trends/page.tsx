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
import { LoadError } from "@/components/dashboard/load-error";
import { LoadMore } from "@/components/dashboard/load-more";

export default function TrendsPage() {
  const { session, isDemo } = useAuth();
  const active = useProjectStore((s) => s.active);
  const { items, loading, loaded, error, loadFeedback, loadMore, total, hasMore, loadingMore } = useBizStore();

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

  if (error && active) {
    return (
      <LoadError
        message={error}
        onRetry={() => void loadFeedback(active.id, session?.access_token || "demo", isDemo)}
      />
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
      <span className="block font-mono text-footnote text-text3 mb-4">
        Weekly message volume
      </span>
      <TrendChart byWeek={byWeek} weeks={weeks} cats={cats} />
      <TrendTable byWeek={byWeek} weeks={weeks} cats={cats} />
      {hasMore && active && (
        <LoadMore loaded={items.length} total={total} loading={loadingMore} onLoad={() => void loadMore(active.id, session?.access_token || "demo", isDemo)} context="responses in this trend" />
      )}
    </div>
  );
}
