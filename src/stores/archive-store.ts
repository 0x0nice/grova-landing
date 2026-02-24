import { create } from "zustand";
import type { FeedbackItem } from "@/types/feedback";
import { apiGet, apiPost } from "@/lib/api";
import { demoGet, demoPost } from "@/lib/demo-data";

interface ArchiveState {
  items: FeedbackItem[];
  loading: boolean;
  loaded: boolean;

  loadArchive: (projectId: string, token: string, isDemo: boolean) => Promise<void>;
  restore: (id: string, token: string, isDemo: boolean) => Promise<void>;
  reset: () => void;
}

export const useArchiveStore = create<ArchiveState>((set) => ({
  items: [],
  loading: false,
  loaded: false,

  loadArchive: async (projectId, token, isDemo) => {
    set({ loading: true });
    try {
      const path = `/feedback?project_id=${projectId}&status=denied`;
      const items = isDemo
        ? (demoGet(path) as FeedbackItem[])
        : await apiGet<FeedbackItem[]>(path, token);
      set({ items, loading: false, loaded: true });
    } catch {
      set({ loading: false });
    }
  },

  restore: async (id, token, isDemo) => {
    try {
      if (isDemo) {
        demoPost(`/feedback/${id}/restore`);
      } else {
        await apiPost(`/feedback/${id}/restore`, {}, token);
      }
      set((s) => ({ items: s.items.filter((i) => i.id !== id) }));
    } catch {
      // keep item on failure
    }
  },

  reset: () => set({ items: [], loading: false, loaded: false }),
}));
