"use client";

import { useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useProjectStore } from "@/stores/project-store";
import { useInboxStore } from "@/stores/inbox-store";
import { effectiveScore } from "@/lib/triage";
import { FilterTabs } from "@/components/dashboard/dev/filter-tabs";
import { StatsBar } from "@/components/dashboard/dev/stats-bar";
import { InboxCard } from "@/components/dashboard/dev/inbox-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

export default function InboxPage() {
  const { session, isDemo } = useAuth();
  const active = useProjectStore((s) => s.active);
  const { items, filter, loading, loaded, loadInbox, setFilter, approve, deny } =
    useInboxStore();

  useEffect(() => {
    if (active && (session?.access_token || isDemo) && !loaded) {
      loadInbox(active.id, session?.access_token || "demo", isDemo);
    }
  }, [active, session?.access_token, isDemo, loaded, loadInbox]);

  const token = session?.access_token || "demo";

  // Apply filter
  const filtered =
    filter === "all"
      ? items
      : filter === "spam"
        ? items.filter((i) => i.triage?.category === "spam")
        : items.filter((i) => i.type === filter);

  // Sort by effective score descending
  const sorted = [...filtered].sort(
    (a, b) => effectiveScore(b) - effectiveScore(a)
  );

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="w-full h-16" />
        <Skeleton className="w-full h-16" />
        <Skeleton className="w-full h-16" />
      </div>
    );
  }

  return (
    <div>
      {items.length > 0 && (
        <>
          <FilterTabs items={items} active={filter} onChange={setFilter} />
          <StatsBar items={filtered} />
        </>
      )}

      {sorted.length === 0 ? (
        <EmptyState
          icon="📥"
          heading="Inbox is empty"
          description={
            loaded
              ? "No pending feedback. New items will appear here when users submit feedback."
              : "Select a project to load feedback."
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((item) => (
            <InboxCard
              key={item.id}
              item={item}
              onApprove={(id) => approve(id, token, isDemo)}
              onDeny={(id) => deny(id, token, isDemo)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
