import { create } from "zustand";
import type { FeedbackItem } from "@/types/feedback";
import { apiGet, apiPost } from "@/lib/api";
import { demoGet, demoPost } from "@/lib/demo-data";

type Filter = "all" | "bug" | "feature" | "ux" | "spam";

interface RemovedSnapshot {
  item: FeedbackItem;
  action: "approve" | "deny";
}

interface InboxState {
  items: FeedbackItem[];
  filter: Filter;
  loading: boolean;
  loaded: boolean;
  lastRemoved: RemovedSnapshot | null;

  loadInbox: (projectId: string, token: string, isDemo: boolean) => Promise<void>;
  setFilter: (filter: Filter) => void;
  approve: (id: string, token: string, isDemo: boolean) => Promise<void>;
  deny: (id: string, token: string, isDemo: boolean) => Promise<void>;
  undoLast: (token: string, isDemo: boolean) => Promise<boolean>;
  reset: () => void;
}

export const useInboxStore = create<InboxState>((set, get) => ({
  items: [],
  filter: "all",
  loading: false,
  loaded: false,
  lastRemoved: null,

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
    const snapshot = get().items.find((i) => i.id === id);
    try {
      if (isDemo) {
        demoPost(`/feedback/${id}/approve`);
      } else {
        await apiPost(`/feedback/${id}/approve`, {}, token);
      }
      set((s) => ({
        items: s.items.filter((i) => i.id !== id),
        lastRemoved: snapshot ? { item: snapshot, action: "approve" } : s.lastRemoved,
      }));
    } catch {
      // keep item in list on failure
    }
  },

  deny: async (id, token, isDemo) => {
    const snapshot = get().items.find((i) => i.id === id);
    try {
      if (isDemo) {
        demoPost(`/feedback/${id}/deny`);
      } else {
        await apiPost(`/feedback/${id}/deny`, {}, token);
      }
      set((s) => ({
        items: s.items.filter((i) => i.id !== id),
        lastRemoved: snapshot ? { item: snapshot, action: "deny" } : s.lastRemoved,
      }));
    } catch {
      // keep item in list on failure
    }
  },

  undoLast: async (token, isDemo) => {
    const last = get().lastRemoved;
    if (!last) return false;
    try {
      if (isDemo) {
        demoPost(`/feedback/${last.item.id}/restore`);
      } else {
        await apiPost(`/feedback/${last.item.id}/restore`, {}, token);
      }
      set((s) => ({
        items: s.items.some((i) => i.id === last.item.id) ? s.items : [last.item, ...s.items],
        lastRemoved: null,
      }));
      return true;
    } catch {
      return false;
    }
  },

  reset: () =>
    set({
      items: [],
      filter: "all",
      loading: false,
      loaded: false,
      lastRemoved: null,
    }),
}));
