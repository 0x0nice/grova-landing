"use client";

import { useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useProjectStore } from "@/stores/project-store";
import { useBizStore } from "@/stores/biz-store";
import { CategorySection } from "@/components/dashboard/biz/category-section";
import { EmptyStatePreview } from "@/components/ui/empty-state-preview";
import { Skeleton } from "@/components/ui/skeleton";
import { DEMO_BIZ_PENDING } from "@/lib/demo-data";
import { feedbackCategory } from "@/lib/biz-helpers";
import { LoadError } from "@/components/dashboard/load-error";
import { LoadMore } from "@/components/dashboard/load-more";

export default function CategoriesPage() {
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
      <div className="flex flex-col gap-3">
        <Skeleton className="h-14" />
        <Skeleton className="h-14" />
        <Skeleton className="h-14" />
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
        kind="folder"
        heading="No categories yet"
        description="Messages will be grouped by category once feedback arrives."
        action={{ label: "Install widget", href: "/dashboard/setup" }}
        previewItems={DEMO_BIZ_PENDING}
        previewLimit={3}
      />
    );
  }

  // Group by the AI triage category, not the raw widget intake type.
  const groups: Record<string, typeof items> = {};
  items.forEach((item) => {
    const cat = feedbackCategory(item);
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(item);
  });

  // Sort by count descending
  const sorted = Object.entries(groups).sort((a, b) => b[1].length - a[1].length);

  return (
    <div>
      {sorted.map(([name, catItems], i) => (
        <CategorySection
          key={name}
          name={name}
          items={catItems}
          defaultOpen={i === 0}
        />
      ))}
      {hasMore && active && (
        <LoadMore loaded={items.length} total={total} loading={loadingMore} onLoad={() => void loadMore(active.id, session?.access_token || "demo", isDemo)} context="categorized responses" />
      )}
    </div>
  );
}
