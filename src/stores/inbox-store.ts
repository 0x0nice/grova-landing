import { create } from "zustand";
import type { FeedbackItem } from "@/types/feedback";
import { apiGet, apiPost } from "@/lib/api";
import { demoGet, demoPost } from "@/lib/demo-data";

type Filter = "all" | "bug" | "feature" | "ux" | "spam";

interface InboxState {
  items: FeedbackItem[];
  filter: Filter;
  loading: boolean;
  loaded: boolean;

  loadInbox: (projectId: string, token: string, isDemo: boolean) => Promise<void>;
  setFilter: (filter: Filter) => void;
  approve: (id: string, token: string, isDemo: boolean) => Promise<void>;
  deny: (id: string, token: string, isDemo: boolean) => Promise<void>;
  reset: () => void;
}

export const useInboxStore = create<InboxState>((set, get) => ({
  items: [],
  filter: "all",
  loading: false,
  loaded: false,

  loadInbox: async (projectId, token, isDemo) => {
    set({ loading: true });
    try {
      const path = `/feedback?project_id=${projectId}&status=pending`;
      const items = isDemo
        ? (demoGet(path) as FeedbackItem[])
        : await apiGet<FeedbackItem[]>(path, token);
      set({ items, loading: false, loaded: true });
    } catch {
      set({ loading: false });
    }
  },

  setFilter: (filter) => set({ filter }),

  approve: async (id, token, isDemo) => {
    try {
      if (isDemo) {
        demoPost(`/feedback/${id}/approve`);
      } else {
        await apiPost(`/feedback/${id}/approve`, {}, token);
      }
      set((s) => ({ items: s.items.filter((i) => i.id !== id) }));
    } catch {
      // keep item in list on failure
    }
  },

  deny: async (id, token, isDemo) => {
    try {
      if (isDemo) {
        demoPost(`/feedback/${id}/deny`);
      } else {
        await apiPost(`/feedback/${id}/deny`, {}, token);
      }
      set((s) => ({ items: s.items.filter((i) => i.id !== id) }));
    } catch {
      // keep item in list on failure
    }
  },

  reset: () => set({ items: [], filter: "all", loading: false, loaded: false }),
}));
