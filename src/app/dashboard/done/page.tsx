"use client";

import { useEffect, useMemo } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useProjectStore } from "@/stores/project-store";
import { useDoneStore } from "@/stores/done-store";
import { DoneCard } from "@/components/dashboard/dev/done-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadError } from "@/components/dashboard/load-error";
import { LoadMore } from "@/components/dashboard/load-more";

export default function DonePage() {
  const { session, isDemo } = useAuth();
  const active = useProjectStore((s) => s.active);
  const { items, loading, loaded, error, loadDone, loadMore, total, hasMore, loadingMore } = useDoneStore();
  const context = useMemo(() => {
    if (!active) return "";
    if (!isDemo) return active.project_context || "";
    if (typeof window === "undefined") return "";
    try {
      return localStorage.getItem(`grova-ctx-${active.id}`) || "";
    } catch {
      return "";
    }
  }, [active, isDemo]);

  useEffect(() => {
    if (active && (session?.access_token || isDemo) && !loaded) {
      loadDone(active.id, session?.access_token || "demo", isDemo);
    }
  }, [active, session?.access_token, isDemo, loaded, loadDone]);

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="w-full h-16" />
        <Skeleton className="w-full h-16" />
      </div>
    );
  }

  if (error && active) {
    return (
      <LoadError
        message={error}
        onRetry={() => void loadDone(active.id, session?.access_token || "demo", isDemo)}
      />
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        kind="done"
        heading="Nothing resolved yet"
        description="Approve items from the Inbox to see their AI prompts here."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <DoneCard key={item.id} item={item} projectContext={context} />
      ))}
      {hasMore && active && (
        <LoadMore loaded={items.length} total={total} loading={loadingMore} onLoad={() => void loadMore(active.id, session?.access_token || "demo", isDemo)} context="resolved items" />
      )}
    </div>
  );
}
