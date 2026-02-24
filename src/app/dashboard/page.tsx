"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProjectStore } from "@/stores/project-store";
import { useAuth } from "@/providers/auth-provider";

export default function DashboardIndex() {
  const router = useRouter();
  const active = useProjectStore((s) => s.active);
  const { isDemo } = useAuth();

  useEffect(() => {
    const params = isDemo ? "?demo" : "";
    if (active) {
      const defaultView =
        active.mode === "developer" ? "inbox" : "overview";
      router.replace(`/dashboard/${defaultView}${params}`);
    } else {
      // No project selected — go to inbox by default
      router.replace(`/dashboard/inbox${params}`);
    }
  }, [active, isDemo, router]);

  return null;
}
