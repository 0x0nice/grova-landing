import { create } from "zustand";
import type { Project } from "@/types/project";
import { apiGet, apiPost } from "@/lib/api";

interface ProjectState {
  projects: Project[];
  active: Project | null;
  loading: boolean;

  loadProjects: (token: string) => Promise<void>;
  selectProject: (project: Project) => void;
  createProject: (
    data: { name: string; mode: string; source: string },
    token: string
  ) => Promise<Project>;
  setProjects: (projects: Project[]) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  active: null,
  loading: false,

  loadProjects: async (token) => {
    set({ loading: true });
    try {
      const projects = await apiGet<Project[]>("/projects", token);
      set({ projects, loading: false });
      if (projects.length > 0 && !get().active) {
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
    } catch {
      set({ loading: false });
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
}));
