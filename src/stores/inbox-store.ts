import { create } from "zustand";
import type { FeedbackItem } from "@/types/feedback";
import { apiGet, apiPost } from "@/lib/api";
import { demoGet, demoPost } from "@/lib/demo-data";
import { errorMessage } from "@/lib/errors";
import { arrayPage, type PageResponse } from "@/types/pagination";

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
  error: string | null;
  page: number;
  total: number;
  hasMore: boolean;
  loadingMore: boolean;
  lastRemoved: RemovedSnapshot | null;

  loadInbox: (projectId: string, token: string, isDemo: boolean) => Promise<void>;
  loadMore: (projectId: string, token: string, isDemo: boolean) => Promise<void>;
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
  error: null,
  page: 0,
  total: 0,
  hasMore: false,
  loadingMore: false,
  lastRemoved: null,

  loadInbox: async (projectId, token, isDemo) => {
    set({ loading: true, error: null });
    try {
      const path = `/feedback?project_id=${projectId}&status=pending&page=1&limit=50`;
      const result = isDemo
        ? arrayPage(demoGet(path) as FeedbackItem[])
        : await apiGet<PageResponse<FeedbackItem>>(path, token);
      set({
        items: result.items,
        page: result.pagination.page,
        total: result.pagination.total,
        hasMore: result.pagination.has_more,
        loading: false,
        loaded: true,
      });
    } catch (error) {
      set({ loading: false, error: errorMessage(error, "Could not load feedback") });
    }
  },

  loadMore: async (projectId, token, isDemo) => {
    const nextPage = get().page + 1;
    if (get().loadingMore || !get().hasMore) return;
    set({ loadingMore: true, error: null });
    try {
      const path = `/feedback?project_id=${projectId}&status=pending&page=${nextPage}&limit=50`;
      const result = isDemo
        ? arrayPage(demoGet(path) as FeedbackItem[])
        : await apiGet<PageResponse<FeedbackItem>>(path, token);
      set((state) => ({
        items: [...state.items, ...result.items.filter((item) => !state.items.some((current) => current.id === item.id))],
        page: result.pagination.page,
        total: result.pagination.total,
        hasMore: result.pagination.has_more,
        loadingMore: false,
      }));
    } catch (error) {
      set({ loadingMore: false, error: errorMessage(error, "Could not load more feedback") });
    }
  },

  setFilter: (filter) => set({ filter }),

  approve: async (id, token, isDemo) => {
    const snapshot = get().items.find((i) => i.id === id);
    if (isDemo) {
      demoPost(`/feedback/${id}/approve`);
    } else {
      await apiPost(`/feedback/${id}/approve`, {}, token);
    }
    set((s) => ({
      items: s.items.filter((i) => i.id !== id),
      total: Math.max(0, s.total - 1),
      lastRemoved: snapshot ? { item: snapshot, action: "approve" } : s.lastRemoved,
    }));
  },

  deny: async (id, token, isDemo) => {
    const snapshot = get().items.find((i) => i.id === id);
    if (isDemo) {
      demoPost(`/feedback/${id}/deny`);
    } else {
      await apiPost(`/feedback/${id}/deny`, {}, token);
    }
    set((s) => ({
      items: s.items.filter((i) => i.id !== id),
      total: Math.max(0, s.total - 1),
      lastRemoved: snapshot ? { item: snapshot, action: "deny" } : s.lastRemoved,
    }));
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
        total: s.items.some((i) => i.id === last.item.id) ? s.total : s.total + 1,
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
      error: null,
      page: 0,
      total: 0,
      hasMore: false,
      loadingMore: false,
      lastRemoved: null,
    }),
}));
