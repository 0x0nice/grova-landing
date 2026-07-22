import { create } from "zustand";
import type { FeedbackItem } from "@/types/feedback";
import { apiGet, apiPost, getProjectPreferences, putProjectPreferences } from "@/lib/api";
import { demoGet, demoPost } from "@/lib/demo-data";
import { errorMessage } from "@/lib/errors";
import { arrayPage, type PageResponse } from "@/types/pagination";

export interface BizConfig {
  name: string;
  type: string;
  categories: string[];
}

interface BizState {
  items: FeedbackItem[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
  page: number;
  total: number;
  hasMore: boolean;
  loadingMore: boolean;
  config: BizConfig;

  loadFeedback: (projectId: string, token: string, isDemo: boolean) => Promise<void>;
  loadMore: (projectId: string, token: string, isDemo: boolean) => Promise<void>;
  approve: (id: string, token: string, isDemo: boolean) => Promise<void>;
  deny: (id: string, token: string, isDemo: boolean) => Promise<void>;
  loadConfig: (projectId: string, token: string, isDemo: boolean) => Promise<void>;
  setConfig: (config: BizConfig) => void;
  saveConfig: (projectId: string, config: BizConfig, token: string, isDemo: boolean) => Promise<void>;
  reset: () => void;
}

const defaultConfig: BizConfig = {
  name: "",
  type: "default",
  categories: ["Complaint", "Compliment", "Question", "Suggestion", "Other"],
};

export const useBizStore = create<BizState>((set, get) => ({
  items: [],
  loading: false,
  loaded: false,
  error: null,
  page: 0,
  total: 0,
  hasMore: false,
  loadingMore: false,
  config: { ...defaultConfig },

  loadFeedback: async (projectId, token, isDemo) => {
    set({ loading: true, error: null });
    try {
      const path = `/feedback?project_id=${projectId}&page=1&limit=100`;
      const result = isDemo
        ? arrayPage(demoGet(path) as FeedbackItem[])
        : await apiGet<PageResponse<FeedbackItem>>(path, token);
      const items = result.items;
      // Sort by created_at descending
      items.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      set({ items, page: result.pagination.page, total: result.pagination.total, hasMore: result.pagination.has_more, loading: false, loaded: true });
    } catch (error) {
      set({ loading: false, error: errorMessage(error, "Could not load business feedback") });
    }
  },

  loadMore: async (projectId, token, isDemo) => {
    if (get().loadingMore || !get().hasMore) return;
    const nextPage = get().page + 1;
    set({ loadingMore: true, error: null });
    try {
      const path = `/feedback?project_id=${projectId}&page=${nextPage}&limit=100`;
      const result = isDemo ? arrayPage(demoGet(path) as FeedbackItem[]) : await apiGet<PageResponse<FeedbackItem>>(path, token);
      set((state) => {
        const items = [...state.items, ...result.items.filter((item) => !state.items.some((current) => current.id === item.id))]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return { items, page: result.pagination.page, total: result.pagination.total, hasMore: result.pagination.has_more, loadingMore: false };
      });
    } catch (error) {
      set({ loadingMore: false, error: errorMessage(error, "Could not load more business feedback") });
    }
  },

  approve: async (id, token, isDemo) => {
    try {
      if (isDemo) demoPost(`/feedback/${id}/approve`);
      else await apiPost(`/feedback/${id}/approve`, {}, token);
      set((s) => ({ items: s.items.map((item) => item.id === id ? { ...item, status: "approved" } : item) }));
    } catch {}
  },

  deny: async (id, token, isDemo) => {
    try {
      if (isDemo) demoPost(`/feedback/${id}/deny`);
      else await apiPost(`/feedback/${id}/deny`, {}, token);
      set((s) => ({ items: s.items.map((item) => item.id === id ? { ...item, status: "denied" } : item) }));
    } catch {}
  },

  loadConfig: async (projectId, token, isDemo) => {
    try {
      if (isDemo) {
        const raw = localStorage.getItem(`grova-biz-config-${projectId}`);
        set({ config: raw ? JSON.parse(raw) : { ...defaultConfig } });
        return;
      }
      const preferences = await getProjectPreferences(projectId, token);
      set({ config: preferences.business_config?.categories?.length ? preferences.business_config : { ...defaultConfig } });
    } catch {
      set({ config: { ...defaultConfig } });
    }
  },

  setConfig: (config) => set({ config }),

  saveConfig: async (projectId, config, token, isDemo) => {
    set({ config });
    if (isDemo) {
      localStorage.setItem(`grova-biz-config-${projectId}`, JSON.stringify(config));
      return;
    }
    await putProjectPreferences(projectId, { business_config: config }, token);
  },

  reset: () =>
    set({
      items: [],
      loading: false,
      loaded: false,
      error: null,
      page: 0,
      total: 0,
      hasMore: false,
      loadingMore: false,
      config: { ...defaultConfig },
    }),
}));
