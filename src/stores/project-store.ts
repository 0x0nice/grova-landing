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

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  active: null,
  loading: false,
  error: null,

  loadProjects: async (token) => {
    set({ loading: true, error: null });
    try {
      const projects = await apiGet<Project[]>("/projects", token);
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
      set({ loading: false, error: errorMessage(error, "Could not load projects") });
    }
  },

  selectProject: (project) => {
    set({ active: project });
    try {
      localStorage.setItem("grova-active-project-id", project.id);
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
  reset: () => set({ projects: [], active: null, loading: false, error: null }),
}));
