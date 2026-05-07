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
import { useToast } from "@/components/ui/toast";

export default function InboxPage() {
  const { session, isDemo } = useAuth();
  const active = useProjectStore((s) => s.active);
  const {
    items,
    filter,
    loading,
    loaded,
    loadInbox,
    setFilter,
    approve,
    deny,
    undoLast,
  } = useInboxStore();
  const { show } = useToast();

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

  function handleApprove(id: string) {
    void approve(id, token, isDemo).then(() => {
      show({
        message: "Moved to Resolved",
        action: {
          label: "Undo",
          onClick: () => {
            void undoLast(token, isDemo);
          },
        },
      });
    });
  }

  function handleDeny(id: string) {
    void deny(id, token, isDemo).then(() => {
      show({
        message: "Dismissed",
        action: {
          label: "Undo",
          onClick: () => {
            void undoLast(token, isDemo);
          },
        },
      });
    });
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton variant="inbox-card" />
        <Skeleton variant="inbox-card" />
        <Skeleton variant="inbox-card" />
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
          kind="inbox"
          heading="Inbox is clear"
          description={
            loaded
              ? "Approved items live in Done. New feedback will appear here, sorted by priority — not recency."
              : "Select a project to load feedback."
          }
          action={
            loaded
              ? { label: "Install widget", href: "/dashboard/setup" }
              : undefined
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((item) => (
            <InboxCard
              key={item.id}
              item={item}
              onApprove={handleApprove}
              onDeny={handleDeny}
            />
          ))}
        </div>
      )}
    </div>
  );
}
