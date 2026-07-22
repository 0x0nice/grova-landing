import { create } from "zustand";
import type { AgentProvider, ChangePackage, ChangeStatus } from "@/types/change";
import { approveChange, approveRelease, dismissChange, getChanges, requestRollback, retryRelease } from "@/lib/api";
import { DEMO_DEV_PENDING } from "@/lib/demo-data";
import { errorMessage } from "@/lib/errors";

export type ChangeFilter = "attention" | "working" | "proof" | "released" | "dismissed" | "all";

function demoChanges(): ChangePackage[] {
  return DEMO_DEV_PENDING.map((feedback, index) => ({
    id: `demo-change-${feedback.id}`,
    project_id: "demo-dev",
    feedback_id: feedback.id,
    version: 1,
    status: "proposal_ready",
    title: feedback.triage?.summary || feedback.message,
    problem_statement: feedback.triage?.summary || feedback.message,
    category: feedback.triage?.category || feedback.type,
    affected_surface_ids: index === 0 ? ["demo-web"] : [],
    proposal: {
      objective: feedback.triage?.recommended_action || `Resolve: ${feedback.message}`,
      problem_statement: feedback.triage?.summary || feedback.message,
      likely_cause: feedback.triage?.reasoning,
      confidence: (feedback.triage?.score || 0) / 10,
      uncertainty: index === 0 ? [] : ["Confirm the affected surface before editing."],
    },
    acceptance_criteria: [
      "The reported behavior is no longer reproducible.",
      "Existing workflows remain unchanged outside the approved scope.",
      "The affected surface passes its verification recipe.",
    ],
    verification_plan: [],
    constraints: ["Work in an isolated worktree.", "Do not deploy from the coding-agent step."],
    prompt: `# Grova Change Package\n\n${feedback.triage?.recommended_action || feedback.message}`,
    prompt_sha256: "demo",
    risk_level: index === 0 ? "protected" : "medium",
    release_policy: { gate: "manual" },
    feedback,
    latest_agent_run: null,
    created_at: feedback.created_at,
    updated_at: feedback.created_at,
  }));
}

export function changeMatchesFilter(status: ChangeStatus, filter: ChangeFilter) {
  if (filter === "all") return true;
  if (filter === "attention") return ["proposal_ready", "approved", "proof_failed", "regressed"].includes(status);
  if (filter === "working") return ["dispatched", "working", "change_ready", "verifying", "deploying"].includes(status);
  if (filter === "proof") return status === "ready_to_release";
  if (filter === "released") return ["deployed", "observing", "closed", "rolled_back"].includes(status);
  return status === "dismissed";
}

interface ChangeState {
  items: ChangePackage[];
  filter: ChangeFilter;
  selectedId: string | null;
  loading: boolean;
  refreshing: boolean;
  loaded: boolean;
  error: string | null;
  page: number;
  total: number;
  hasMore: boolean;
  load: (projectId: string, token: string, isDemo: boolean, refresh?: boolean) => Promise<void>;
  select: (id: string) => void;
  setFilter: (filter: ChangeFilter) => void;
  approve: (
    id: string,
    provider: AgentProvider,
    dispatchMode: "local_automated" | "interactive",
    token: string,
    isDemo: boolean
  ) => Promise<{ handoff?: { kind: string; url?: string; prompt?: string } | null }>;
  dismiss: (id: string, rationale: string | null, token: string, isDemo: boolean) => Promise<void>;
  release: (
    id: string,
    releaseId: string,
    targets: Array<{ surface_id: string; environment: string }>,
    token: string,
    isDemo: boolean
  ) => Promise<void>;
  rollback: (id: string, releaseId: string, deploymentId: string, rationale: string, token: string) => Promise<void>;
  retryRelease: (id: string, releaseId: string, rationale: string | null, token: string) => Promise<void>;
  reset: () => void;
}

let loadVersion = 0;

export const useChangeStore = create<ChangeState>((set, get) => ({
  items: [],
  filter: "attention",
  selectedId: null,
  loading: false,
  refreshing: false,
  loaded: false,
  error: null,
  page: 0,
  total: 0,
  hasMore: false,

  load: async (projectId, token, isDemo, refresh = false) => {
    const version = ++loadVersion;
    const firstLoad = !get().loaded;
    set({ loading: firstLoad, refreshing: !firstLoad || refresh, error: null });
    try {
      const result = isDemo
        ? {
            items: demoChanges(),
            pagination: { page: 1, total: DEMO_DEV_PENDING.length, has_more: false },
          }
        : await getChanges(projectId, token);
      if (version !== loadVersion) return;
      const selected = get().selectedId;
      const selectionStillExists = selected && result.items.some(item => item.id === selected);
      set({
        items: result.items,
        selectedId: selectionStillExists ? selected : result.items[0]?.id || null,
        page: result.pagination.page,
        total: result.pagination.total,
        hasMore: result.pagination.has_more,
        loading: false,
        refreshing: false,
        loaded: true,
      });
    } catch (error) {
      if (version !== loadVersion) return;
      set({
        loading: false,
        refreshing: false,
        error: errorMessage(error, "Could not load changes"),
      });
    }
  },

  select: selectedId => set({ selectedId }),
  setFilter: filter => set({ filter }),

  approve: async (id, provider, dispatchMode, token, isDemo) => {
    if (isDemo) {
      set(state => ({
        items: state.items.map(item => item.id === id ? {
          ...item,
          status: dispatchMode === "local_automated" ? "dispatched" : "approved",
          latest_agent_run: {
            id: `demo-run-${id}`,
            change_package_id: id,
            provider,
            dispatch_mode: dispatchMode,
            status: dispatchMode === "local_automated" ? "queued" : "awaiting_input",
            created_at: new Date().toISOString(),
          },
        } : item),
      }));
      return { handoff: null };
    }
    const response = await approveChange(id, provider, dispatchMode, token);
    set(state => ({
      items: state.items.map(item => item.id === id ? {
        ...item,
        ...response.change_package,
        feedback: item.feedback,
        latest_agent_run: response.agent_run,
      } : item),
    }));
    return { handoff: response.handoff };
  },

  dismiss: async (id, rationale, token, isDemo) => {
    if (!isDemo) await dismissChange(id, rationale, token);
    set(state => ({
      items: state.items.map(item => item.id === id ? { ...item, status: "dismissed" } : item),
    }));
  },

  release: async (id, releaseId, targets, token, isDemo) => {
    if (isDemo) {
      set(state => ({
        items: state.items.map(item => item.id === id ? { ...item, status: "deploying" } : item),
      }));
      return;
    }
    const response = await approveRelease(releaseId, targets, token);
    set(state => ({
      items: state.items.map(item => item.id === id ? {
        ...item,
        ...response.change_package,
        feedback: item.feedback,
      } : item),
    }));
  },

  rollback: async (id, releaseId, deploymentId, rationale, token) => {
    await requestRollback(releaseId, deploymentId, rationale, token);
    set(state => ({
      items: state.items.map(item => item.id === id ? { ...item, status: "deploying" } : item),
    }));
  },

  retryRelease: async (id, releaseId, rationale, token) => {
    const response = await retryRelease(releaseId, rationale, token);
    set(state => ({
      items: state.items.map(item => item.id === id ? {
        ...item,
        ...response.change_package,
        feedback: item.feedback,
      } : item),
    }));
  },

  reset: () => {
    loadVersion += 1;
    set({
      items: [], filter: "attention", selectedId: null, loading: false,
      refreshing: false, loaded: false, error: null, page: 0, total: 0, hasMore: false,
    });
  },
}));
