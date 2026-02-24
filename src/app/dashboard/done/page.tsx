"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useProjectStore } from "@/stores/project-store";
import { useDoneStore } from "@/stores/done-store";
import { DoneCard } from "@/components/dashboard/dev/done-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

export default function DonePage() {
  const { session, isDemo } = useAuth();
  const active = useProjectStore((s) => s.active);
  const { items, loading, loaded, loadDone } = useDoneStore();
  const [context, setContext] = useState("");

  useEffect(() => {
    if (active && (session?.access_token || isDemo) && !loaded) {
      loadDone(active.id, session?.access_token || "demo", isDemo);
    }
  }, [active, session?.access_token, isDemo, loaded, loadDone]);

  // Load project context from localStorage
  useEffect(() => {
    if (active) {
      const ctx = localStorage.getItem(`grova-ctx-${active.id}`) || "";
      setContext(ctx);
    }
  }, [active]);

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="w-full h-16" />
        <Skeleton className="w-full h-16" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon="✅"
        heading="Nothing approved yet"
        description="Approve items from the Inbox to see their Cursor prompts here."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <DoneCard key={item.id} item={item} projectContext={context} />
      ))}
    </div>
  );
}
