import { create } from "zustand";
import type { FeedbackItem } from "@/types/feedback";
import { apiGet } from "@/lib/api";
import { demoGet } from "@/lib/demo-data";

interface DoneState {
  items: FeedbackItem[];
  loading: boolean;
  loaded: boolean;

  loadDone: (projectId: string, token: string, isDemo: boolean) => Promise<void>;
  reset: () => void;
}

export const useDoneStore = create<DoneState>((set) => ({
  items: [],
  loading: false,
  loaded: false,

  loadDone: async (projectId, token, isDemo) => {
    set({ loading: true });
    try {
      const path = `/feedback?project_id=${projectId}&status=approved`;
      const items = isDemo
        ? (demoGet(path) as FeedbackItem[])
        : await apiGet<FeedbackItem[]>(path, token);
      set({ items, loading: false, loaded: true });
    } catch {
      set({ loading: false });
    }
  },

  reset: () => set({ items: [], loading: false, loaded: false }),
}));
