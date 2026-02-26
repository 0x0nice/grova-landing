import { create } from "zustand";
import type { FeedbackItem } from "@/types/feedback";
import { apiGet, apiPost } from "@/lib/api";
import { demoGet, demoPost } from "@/lib/demo-data";

export interface BizConfig {
  name: string;
  type: string;
  categories: string[];
}

interface BizState {
  items: FeedbackItem[];
  loading: boolean;
  loaded: boolean;
  config: BizConfig;

  loadFeedback: (projectId: string, token: string, isDemo: boolean) => Promise<void>;
  approve: (id: string, token: string, isDemo: boolean) => Promise<void>;
  deny: (id: string, token: string, isDemo: boolean) => Promise<void>;
  loadConfig: (projectId: string) => void;
  saveConfig: (projectId: string, config: BizConfig) => void;
  reset: () => void;
}

const defaultConfig: BizConfig = {
  name: "",
  type: "default",
  categories: ["Complaint", "Compliment", "Question", "Suggestion", "Other"],
};

export const useBizStore = create<BizState>((set) => ({
  items: [],
  loading: false,
  loaded: false,
  config: { ...defaultConfig },

  loadFeedback: async (projectId, token, isDemo) => {
    set({ loading: true });
    try {
      const path = `/feedback?project_id=${projectId}`;
      const items = isDemo
        ? (demoGet(path) as FeedbackItem[])
        : await apiGet<FeedbackItem[]>(path, token);
      // Sort by created_at descending
      items.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      set({ items, loading: false, loaded: true });
    } catch {
      set({ loading: false });
    }
  },

  approve: async (id, token, isDemo) => {
    try {
      if (isDemo) demoPost(`/feedback/${id}/approve`);
      else await apiPost(`/feedback/${id}/approve`, {}, token);
      set((s) => ({
        items: s.items.map((i) =>
          i.id === id ? { ...i, status: "approved" as const } : i
        ),
      }));
    } catch {}
  },

  deny: async (id, token, isDemo) => {
    try {
      if (isDemo) demoPost(`/feedback/${id}/deny`);
      else await apiPost(`/feedback/${id}/deny`, {}, token);
      set((s) => ({
        items: s.items.map((i) =>
          i.id === id ? { ...i, status: "denied" as const } : i
        ),
      }));
    } catch {}
  },

  loadConfig: (projectId) => {
    try {
      const raw = localStorage.getItem(`grova-biz-config-${projectId}`);
      if (raw) {
        set({ config: JSON.parse(raw) });
      } else {
        set({ config: { ...defaultConfig } });
      }
    } catch {
      set({ config: { ...defaultConfig } });
    }
  },

  saveConfig: (projectId, config) => {
    localStorage.setItem(
      `grova-biz-config-${projectId}`,
      JSON.stringify(config)
    );
    set({ config });
  },

  reset: () =>
    set({
      items: [],
      loading: false,
      loaded: false,
      config: { ...defaultConfig },
    }),
}));
