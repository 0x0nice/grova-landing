import { create } from "zustand";
import type { Project } from "@/types/project";
import { apiGet, apiPost } from "@/lib/api";
import { errorMessage } from "@/lib/errors";

interface ProjectState {
  projects: Project[];
  active: Project | null;
  loading: boolean;
  error: string | null;

  loadProjects: (token: string) => Promise<void>;
  selectProject: (project: Project) => void;
  createProject: (
    data: { name: string; mode: string; source: string },
    token: string
  ) => Promise<Project>;
  setProjects: (projects: Project[]) => void;
  reset: () => void;
}

let projectLoadVersion = 0;

function savedProject(): Project | null {
  if (typeof window === "undefined") return null;
  try {
    const value = localStorage.getItem("grova-active-project");
    return value ? JSON.parse(value) as Project : null;
  } catch {
    return null;
  }
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  active: null,
  loading: false,
  error: null,

  loadProjects: async (token) => {
    // React can run mount effects more than once in development. More importantly,
    // consumers should never be able to start overlapping project refreshes: each
    // response replaces `active` with a fresh object and used to create a reload
    // loop in the dashboard shell.
    if (get().loading) return;
    const loadVersion = ++projectLoadVersion;
    const cached = get().active || savedProject();
    set({ loading: true, error: null, active: cached });
    try {
      const projects = await apiGet<Project[]>("/projects", token);
      if (loadVersion !== projectLoadVersion) return;
      const current = get().active;
      const currentMatch = current
        ? projects.find((project) => project.id === current.id)
        : null;

      set({ projects, loading: false, active: currentMatch || null });
      if (projects.length > 0 && !currentMatch) {
        // Restore previously selected project from localStorage
        let restored = false;
        try {
          const savedId = localStorage.getItem("grova-active-project-id");
          if (savedId) {
            const match = projects.find((p) => p.id === savedId);
            if (match) {
              set({ active: match });
              restored = true;
            }
          }
        } catch {}
        if (!restored) set({ active: projects[0] });
      }
      if (projects.length === 0) set({ active: null });
    } catch (error) {
      if (loadVersion !== projectLoadVersion) return;
      set({ loading: false, error: errorMessage(error, "Could not load projects") });
    }
  },

  selectProject: (project) => {
    set({ active: project });
    try {
      localStorage.setItem("grova-active-project-id", project.id);
      localStorage.setItem("grova-active-project", JSON.stringify(project));
    } catch {}
  },

  createProject: async (data, token) => {
    const project = await apiPost<Project>("/projects", data, token);
    set((s) => ({
      projects: [...s.projects, project],
      active: project,
    }));
    return project;
  },

  setProjects: (projects) => set({ projects }),
  reset: () => {
    projectLoadVersion += 1;
    set({ projects: [], active: null, loading: false, error: null });
  },
}));
