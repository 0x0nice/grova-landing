"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useProjectStore } from "@/stores/project-store";
import { useInboxStore } from "@/stores/inbox-store";
import { effectiveScore, signalCount } from "@/lib/triage";
import { FilterTabs } from "@/components/dashboard/dev/filter-tabs";
import { InboxCard } from "@/components/dashboard/dev/inbox-card";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { EmptyStatePreview } from "@/components/ui/empty-state-preview";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useLastVisit, sinceLabel } from "@/hooks/use-last-visit";
import { DEMO_DEV_PENDING } from "@/lib/demo-data";
import { LoadError } from "@/components/dashboard/load-error";
import { DecisionQueue } from "@/components/dashboard/dev/decision-queue";
import { errorMessage } from "@/lib/errors";
import { LoadMore } from "@/components/dashboard/load-more";

const HIGH_PRIORITY_THRESHOLD = 7;

export default function InboxPage() {
  const { session, isDemo } = useAuth();
  const active = useProjectStore((s) => s.active);
  const {
    items,
    filter,
    loading,
    loaded,
    error,
    loadInbox,
    setFilter,
    approve,
    deny,
    undoLast,
    total,
    hasMore,
    loadingMore,
    loadMore,
  } = useInboxStore();
  const { show } = useToast();
  const { previousVisit } = useLastVisit(active?.id ?? null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (active && (session?.access_token || isDemo) && !loaded) {
      loadInbox(active.id, session?.access_token || "demo", isDemo);
    }
  }, [active, session?.access_token, isDemo, loaded, loadInbox]);

  const token = session?.access_token || "demo";

  const filtered =
    filter === "all"
      ? items
      : filter === "spam"
        ? items.filter((i) => i.triage?.category === "spam")
        : items.filter((i) => i.type === filter);

  const sorted = [...filtered].sort(
    (a, b) => effectiveScore(b) - effectiveScore(a)
  );
  const selectedItem = sorted.find((item) => item.id === selectedId) || sorted[0];

  const highPriorityCount = items.filter(
    (i) => effectiveScore(i) >= HIGH_PRIORITY_THRESHOLD
  ).length;
  const visitLabel = sinceLabel(previousVisit);
  const sinceCount = previousVisit
    ? items.filter(
        (i) => new Date(i.created_at).getTime() > previousVisit.getTime()
      ).length
    : 0;
  const scores = items.map(effectiveScore);
  const averageScore = scores.length
    ? scores.reduce((sum, score) => sum + score, 0) / scores.length
    : 0;
  const peakScore = scores.length ? Math.max(...scores) : 0;
  const multiSignalCount = items.filter((item) => signalCount(item) > 1).length;

  function handleApprove(id: string) {
    void approve(id, token, isDemo)
      .then(() => {
        show({
          message: "Moved to Resolved",
          action: {
            label: "Undo",
            onClick: () => {
              void undoLast(token, isDemo);
            },
          },
        });
      })
      .catch((error) => show(errorMessage(error, "Could not resolve feedback")));
  }

  function handleDeny(id: string) {
    void deny(id, token, isDemo)
      .then(() => {
        show({
          message: "Dismissed",
          action: {
            label: "Undo",
            onClick: () => {
              void undoLast(token, isDemo);
            },
          },
        });
      })
      .catch((error) => show(errorMessage(error, "Could not dismiss feedback")));
  }

  if (loading) {
    return (
      <div>
        <DashboardHero title="Inbox" />
        <div className="flex flex-col gap-3">
          <Skeleton variant="inbox-card" />
          <Skeleton variant="inbox-card" />
          <Skeleton variant="inbox-card" />
        </div>
      </div>
    );
  }

  if (error && active) {
    return (
      <div>
        <DashboardHero title="Inbox" />
        <LoadError
          message={error}
          onRetry={() => void loadInbox(active.id, token, isDemo)}
        />
      </div>
    );
  }

  const isEmpty = sorted.length === 0;
  return (
    <div>
      <header className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4 lg:overflow-x-auto scrollbar-none">
        <div className="flex items-baseline gap-2 shrink-0">
          <h1 className="font-serif text-title text-text leading-none">Inbox</h1>
          <span className="font-mono text-micro text-text3 tabular-nums">
            {loaded ? `${items.length} pending` : "Loading"}
          </span>
        </div>

        {items.length > 0 && (
          <>
            <FilterTabs
              items={items}
              active={filter}
              onChange={setFilter}
              className="mb-0 shrink-0"
            />
            <div className="flex items-baseline gap-4 lg:ml-auto shrink-0 font-mono text-micro text-text3 tabular-nums whitespace-nowrap">
              {sinceCount > 0 && visitLabel && (
                <span className="text-accent">+{sinceCount} since {visitLabel}</span>
              )}
              <span><strong className="font-normal text-text">{highPriorityCount}</strong> high</span>
              <span><strong className="font-normal text-text">{averageScore.toFixed(1)}</strong> avg</span>
              <span><strong className="font-normal text-text">{peakScore.toFixed(1)}</strong> peak</span>
              <span><strong className="font-normal text-text">{multiSignalCount}</strong> multi-signal</span>
            </div>
          </>
        )}
      </header>

      {isEmpty ? (
        <EmptyStatePreview
          kind="inbox"
          heading="Inbox is clear"
          description={
            loaded
              ? "Approved items live in Done. New feedback will appear here, sorted by priority - not recency."
              : "Select a project to load feedback."
          }
          action={
            loaded
              ? { label: "Install widget", href: "/dashboard/setup" }
              : undefined
          }
          previewItems={loaded ? DEMO_DEV_PENDING : []}
          previewLimit={3}
        />
      ) : (
        <>
          <div className="hidden lg:grid grid-cols-[minmax(260px,0.8fr)_minmax(0,1.7fr)] gap-5 items-start">
            <DecisionQueue
              items={sorted}
              selectedId={selectedItem.id}
              onSelect={setSelectedId}
            />
            <div className="sticky top-20 min-w-0">
              <InboxCard
                key={selectedItem.id}
                item={selectedItem}
                onApprove={handleApprove}
                onDeny={handleDeny}
                defaultExpanded
              />
            </div>
          </div>
          <div className="flex flex-col gap-3 lg:hidden">
            {sorted.map((item) => (
              <InboxCard
                key={item.id}
                item={item}
                onApprove={handleApprove}
                onDeny={handleDeny}
              />
            ))}
          </div>
          {hasMore && active && (
            <LoadMore
              loaded={items.length}
              total={total}
              loading={loadingMore}
              onLoad={() => void loadMore(active.id, token, isDemo)}
              context="pending items"
            />
          )}
        </>
      )}
    </div>
  );
}
