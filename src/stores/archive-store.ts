import { create } from "zustand";
import type { FeedbackItem } from "@/types/feedback";
import { apiGet, apiPost } from "@/lib/api";
import { demoGet, demoPost } from "@/lib/demo-data";
import { errorMessage } from "@/lib/errors";
import { arrayPage, type PageResponse } from "@/types/pagination";

interface ArchiveState {
  items: FeedbackItem[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
  page: number;
  total: number;
  hasMore: boolean;
  loadingMore: boolean;

  loadArchive: (projectId: string, token: string, isDemo: boolean) => Promise<void>;
  loadMore: (projectId: string, token: string, isDemo: boolean) => Promise<void>;
  restore: (id: string, token: string, isDemo: boolean) => Promise<void>;
  reset: () => void;
}

export const useArchiveStore = create<ArchiveState>((set, get) => ({
  items: [],
  loading: false,
  loaded: false,
  error: null,
  page: 0,
  total: 0,
  hasMore: false,
  loadingMore: false,

  loadArchive: async (projectId, token, isDemo) => {
    set({ loading: true, error: null });
    try {
      const path = `/feedback?project_id=${projectId}&status=denied&page=1&limit=50`;
      const result = isDemo ? arrayPage(demoGet(path) as FeedbackItem[]) : await apiGet<PageResponse<FeedbackItem>>(path, token);
      set({ items: result.items, page: result.pagination.page, total: result.pagination.total, hasMore: result.pagination.has_more, loading: false, loaded: true });
    } catch (error) {
      set({ loading: false, error: errorMessage(error, "Could not load dismissed feedback") });
    }
  },

  loadMore: async (projectId, token, isDemo) => {
    if (get().loadingMore || !get().hasMore) return;
    const nextPage = get().page + 1;
    set({ loadingMore: true, error: null });
    try {
      const path = `/feedback?project_id=${projectId}&status=denied&page=${nextPage}&limit=50`;
      const result = isDemo ? arrayPage(demoGet(path) as FeedbackItem[]) : await apiGet<PageResponse<FeedbackItem>>(path, token);
      set((state) => ({ items: [...state.items, ...result.items.filter((item) => !state.items.some((current) => current.id === item.id))], page: result.pagination.page, total: result.pagination.total, hasMore: result.pagination.has_more, loadingMore: false }));
    } catch (error) {
      set({ loadingMore: false, error: errorMessage(error, "Could not load more dismissed feedback") });
    }
  },

  restore: async (id, token, isDemo) => {
    try {
      if (isDemo) {
        demoPost(`/feedback/${id}/restore`);
      } else {
        await apiPost(`/feedback/${id}/restore`, {}, token);
      }
      set((s) => ({ items: s.items.filter((i) => i.id !== id), total: Math.max(0, s.total - 1) }));
    } catch {
      // keep item on failure
    }
  },

  reset: () => set({ items: [], loading: false, loaded: false, error: null, page: 0, total: 0, hasMore: false, loadingMore: false }),
}));
