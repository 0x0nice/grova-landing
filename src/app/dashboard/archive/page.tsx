"use client";

import { useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useProjectStore } from "@/stores/project-store";
import { useArchiveStore } from "@/stores/archive-store";
import { ArchiveCard } from "@/components/dashboard/dev/archive-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadError } from "@/components/dashboard/load-error";
import { LoadMore } from "@/components/dashboard/load-more";

export default function ArchivePage() {
  const { session, isDemo } = useAuth();
  const active = useProjectStore((s) => s.active);
  const { items, loading, loaded, error, loadArchive, loadMore, restore, total, hasMore, loadingMore } = useArchiveStore();

  useEffect(() => {
    if (active && (session?.access_token || isDemo) && !loaded) {
      loadArchive(active.id, session?.access_token || "demo", isDemo);
    }
  }, [active, session?.access_token, isDemo, loaded, loadArchive]);

  const token = session?.access_token || "demo";

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="w-full h-12" />
        <Skeleton className="w-full h-12" />
      </div>
    );
  }

  if (error && active) {
    return (
      <LoadError
        message={error}
        onRetry={() => void loadArchive(active.id, session?.access_token || "demo", isDemo)}
      />
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        kind="archive"
        heading="Archive is empty"
        description="Dismissed feedback items will appear here."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <ArchiveCard
          key={item.id}
          item={item}
          onRestore={(id) => restore(id, token, isDemo)}
        />
      ))}
      {hasMore && active && (
        <LoadMore loaded={items.length} total={total} loading={loadingMore} onLoad={() => void loadMore(active.id, token, isDemo)} context="dismissed items" />
      )}
    </div>
  );
}
