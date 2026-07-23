"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useProjectStore } from "@/stores/project-store";
import { changeMatchesFilter, useChangeStore } from "@/stores/change-store";
import { ChangeStageFilter } from "@/components/dashboard/dev/change-stage-filter";
import { ChangeQueue } from "@/components/dashboard/dev/change-queue";
import { ChangeDetailPanel } from "@/components/dashboard/dev/change-detail";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadError } from "@/components/dashboard/load-error";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/components/ui/toast";
import { errorMessage } from "@/lib/errors";
import type { AgentProvider } from "@/types/change";

export default function InboxPage() {
  const { session, isDemo } = useAuth();
  const active = useProjectStore(state => state.active);
  const {
    items, filter, selectedId, loading, refreshing, loaded, error,
    load, select, setFilter, approve, dismiss, release, rollback, retryRelease,
  } = useChangeStore();
  const { show } = useToast();
  const token = session?.access_token || "demo";
  const [mobileDetailId, setMobileDetailId] = useState<string | null>(null);
  const knownItems = useRef<{ projectId: string; ids: Set<string> } | null>(null);
  const lastBackgroundCheck = useRef(0);

  useEffect(() => {
    if (active && (session?.access_token || isDemo) && !loaded) {
      void load(active.id, token, isDemo);
    }
  }, [active, session?.access_token, isDemo, loaded, load, token]);

  useEffect(() => {
    if (!active || !loaded) return;
    const previous = knownItems.current;
    if (!previous || previous.projectId !== active.id) {
      knownItems.current = { projectId: active.id, ids: new Set(items.map(item => item.id)) };
      return;
    }
    const arrived = items.filter(item => !previous.ids.has(item.id));
    knownItems.current = { projectId: active.id, ids: new Set(items.map(item => item.id)) };
    if (arrived.length === 1) show("New feedback is ready for review");
    if (arrived.length > 1) show(`${arrived.length} new feedback items are ready for review`);
  }, [active, items, loaded, show]);

  useEffect(() => {
    if (!active || !session?.access_token || isDemo) return;
    const check = () => {
      if (document.visibilityState !== "visible") return;
      const now = Date.now();
      if (now - lastBackgroundCheck.current < 10_000) return;
      lastBackgroundCheck.current = now;
      void load(active.id, token, false, "background");
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") check();
    };
    const timer = window.setInterval(check, 60_000);
    window.addEventListener("focus", check);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", check);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [active, session?.access_token, isDemo, load, token]);

  const visible = useMemo(
    () => items.filter(item => changeMatchesFilter(item.status, filter)),
    [items, filter]
  );
  const selected = visible.find(item => item.id === selectedId) || visible[0] || null;
  const needsYou = items.filter(item => changeMatchesFilter(item.status, "attention")).length;
  const working = items.filter(item => changeMatchesFilter(item.status, "working")).length;
  const proofReady = items.filter(item => changeMatchesFilter(item.status, "proof")).length;

  useEffect(() => {
    if (selected && selected.id !== selectedId) select(selected.id);
  }, [selected, selectedId, select]);

  async function handleApprove(provider: AgentProvider, mode: "local_automated" | "interactive") {
    if (!selected) return;
    try {
      const result = await approve(selected.id, provider, mode, token, isDemo);
      if (result.handoff?.kind === "deep_link" && result.handoff.url) {
        window.location.href = result.handoff.url;
        show("Opened the approved Change Package in Codex");
      } else if (result.handoff?.kind === "prompt" && result.handoff.prompt) {
        await navigator.clipboard.writeText(result.handoff.prompt);
        show("Approved prompt copied for Claude Code");
      } else {
        show(`Approved and queued for ${provider === "codex" ? "Codex" : "Claude Code"}`);
      }
      setFilter(mode === "local_automated" ? "working" : "all");
    } catch (error) {
      show(errorMessage(error, "Could not approve this change"));
      throw error;
    }
  }

  async function handleDismiss(rationale: string | null) {
    if (!selected) return;
    try {
      await dismiss(selected.id, rationale, token, isDemo);
      show("Change proposal dismissed");
    } catch (error) {
      show(errorMessage(error, "Could not dismiss this change"));
      throw error;
    }
  }

  async function handleRelease(releaseId: string, targets: Array<{ surface_id: string; environment: string }>) {
    if (!selected) return;
    try {
      await release(selected.id, releaseId, targets, token, isDemo);
      show("Release queued on your paired Mac");
      setFilter("working");
    } catch (error) {
      show(errorMessage(error, "Could not release this change"));
      throw error;
    }
  }

  async function handleRollback(releaseId: string, deploymentId: string, rationale: string) {
    if (!selected) return;
    try {
      await rollback(selected.id, releaseId, deploymentId, rationale, token);
      show("Rollback queued on your paired Mac");
      setFilter("working");
    } catch (error) {
      show(errorMessage(error, "Could not request rollback"));
      throw error;
    }
  }

  async function handleReleaseRetry(releaseId: string, rationale: string | null) {
    if (!selected) return;
    try {
      await retryRelease(selected.id, releaseId, rationale, token);
      show("Failed release targets queued again");
      setFilter("working");
    } catch (error) {
      show(errorMessage(error, "Could not retry this release"));
      throw error;
    }
  }

  if (loading) {
    return (
      <div>
        <div className="h-10 mb-5 flex items-center gap-3">
          <Skeleton className="w-40 h-7" />
          <Skeleton className="w-96 h-8" />
        </div>
        <div className="grid grid-cols-[minmax(280px,0.75fr)_minmax(0,1.65fr)] gap-5 max-lg:grid-cols-1">
          <Skeleton className="h-[520px]" />
          <Skeleton className="h-[650px]" />
        </div>
      </div>
    );
  }

  if (error && active && items.length === 0) {
    return <LoadError message={error} onRetry={() => void load(active.id, token, isDemo)} />;
  }

  return (
    <div>
      <header className="mb-5 flex items-center gap-4 min-w-0 overflow-x-auto scrollbar-none">
        <div className="flex items-baseline gap-2 shrink-0">
          <h1 className="font-serif text-title text-text leading-none">Changes</h1>
          <span className="text-micro text-text3 tabular-nums">{items.length}</span>
        </div>
        <ChangeStageFilter
          items={items}
          value={filter}
          onChange={value => {
            setFilter(value);
            setMobileDetailId(null);
          }}
        />
        <div className="ml-auto flex items-center gap-4 shrink-0 text-micro text-text3 tabular-nums whitespace-nowrap max-md:hidden">
          <span><strong className="font-medium text-text">{needsYou}</strong> needs you</span>
          <span><strong className="font-medium text-text">{working}</strong> working</span>
          <span><strong className="font-medium text-text">{proofReady}</strong> proven</span>
          {active && (
            <button
              type="button"
              onClick={() => void load(active.id, token, isDemo, "manual")}
              disabled={refreshing}
              className="text-text3 hover:text-text transition-colors cursor-pointer disabled:opacity-50"
            >
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>
          )}
        </div>
      </header>

      {error && active && (
        <div className="mb-4 bg-red-dim px-4 py-3 text-footnote text-red flex items-center justify-between gap-4">
          <span>{error}. Existing change data is still shown.</span>
          <button type="button" onClick={() => void load(active.id, token, isDemo, "manual")} className="font-medium cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {!selected ? (
        <EmptyState
          kind="inbox"
          heading={loaded ? "No changes in this stage" : "Select a project"}
          description={loaded
            ? "New reports appear here after Grova interprets the evidence into an actionable Change Package."
            : "Choose a project to load its change queue."}
        />
      ) : (
        <div className="grid grid-cols-[minmax(280px,0.72fr)_minmax(0,1.7fr)] gap-5 items-start max-lg:grid-cols-1">
          <div className={`${mobileDetailId === selected.id ? "max-lg:hidden" : ""} max-h-[calc(100vh-9rem)] overflow-y-auto border-t border-border max-lg:max-h-none`}>
            <ChangeQueue
              items={visible}
              selectedId={selected.id}
              onSelect={id => {
                select(id);
                setMobileDetailId(id);
              }}
            />
          </div>
          <div className={`${mobileDetailId === selected.id ? "" : "max-lg:hidden"} min-w-0 lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto`}>
            <button
              type="button"
              onClick={() => setMobileDetailId(null)}
              className="hidden max-lg:block mb-3 text-footnote font-medium text-text2 hover:text-text cursor-pointer"
            >
              Back to changes
            </button>
            <ChangeDetailPanel
              key={selected.id}
              item={selected}
              onApprove={handleApprove}
              onDismiss={handleDismiss}
              onRelease={handleRelease}
              onRollback={handleRollback}
              onRetryRelease={handleReleaseRetry}
            />
          </div>
        </div>
      )}
    </div>
  );
}
