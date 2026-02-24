"use client";

import { useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useProjectStore } from "@/stores/project-store";
import { useArchiveStore } from "@/stores/archive-store";
import { ArchiveCard } from "@/components/dashboard/dev/archive-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

export default function ArchivePage() {
  const { session, isDemo } = useAuth();
  const active = useProjectStore((s) => s.active);
  const { items, loading, loaded, loadArchive, restore } = useArchiveStore();

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

  if (items.length === 0) {
    return (
      <EmptyState
        icon="🗄️"
        heading="Archive is empty"
        description="Denied feedback items will appear here."
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
    </div>
  );
}
