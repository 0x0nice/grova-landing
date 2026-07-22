import { create } from "zustand";
import type { FeedbackItem } from "@/types/feedback";
import { apiGet } from "@/lib/api";
import { demoGet } from "@/lib/demo-data";
import { errorMessage } from "@/lib/errors";
import { arrayPage, type PageResponse } from "@/types/pagination";

interface DoneState {
  items: FeedbackItem[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
  page: number;
  total: number;
  hasMore: boolean;
  loadingMore: boolean;

  loadDone: (projectId: string, token: string, isDemo: boolean) => Promise<void>;
  loadMore: (projectId: string, token: string, isDemo: boolean) => Promise<void>;
  reset: () => void;
}

export const useDoneStore = create<DoneState>((set, get) => ({
  items: [],
  loading: false,
  loaded: false,
  error: null,
  page: 0,
  total: 0,
  hasMore: false,
  loadingMore: false,

  loadDone: async (projectId, token, isDemo) => {
    set({ loading: true, error: null });
    try {
      const path = `/feedback?project_id=${projectId}&status=approved&page=1&limit=50`;
      const result = isDemo
        ? arrayPage(demoGet(path) as FeedbackItem[])
        : await apiGet<PageResponse<FeedbackItem>>(path, token);
      set({ items: result.items, page: result.pagination.page, total: result.pagination.total, hasMore: result.pagination.has_more, loading: false, loaded: true });
    } catch (error) {
      set({ loading: false, error: errorMessage(error, "Could not load resolved feedback") });
    }
  },

  loadMore: async (projectId, token, isDemo) => {
    if (get().loadingMore || !get().hasMore) return;
    const nextPage = get().page + 1;
    set({ loadingMore: true, error: null });
    try {
      const path = `/feedback?project_id=${projectId}&status=approved&page=${nextPage}&limit=50`;
      const result = isDemo ? arrayPage(demoGet(path) as FeedbackItem[]) : await apiGet<PageResponse<FeedbackItem>>(path, token);
      set((state) => ({ items: [...state.items, ...result.items.filter((item) => !state.items.some((current) => current.id === item.id))], page: result.pagination.page, total: result.pagination.total, hasMore: result.pagination.has_more, loadingMore: false }));
    } catch (error) {
      set({ loadingMore: false, error: errorMessage(error, "Could not load more resolved feedback") });
    }
  },

  reset: () => set({ items: [], loading: false, loaded: false, error: null, page: 0, total: 0, hasMore: false, loadingMore: false }),
}));
