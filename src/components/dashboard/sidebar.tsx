"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { useProjectStore } from "@/stores/project-store";
import { useInboxStore } from "@/stores/inbox-store";
import { useDoneStore } from "@/stores/done-store";
import { useArchiveStore } from "@/stores/archive-store";
import { useBizStore } from "@/stores/biz-store";
import { DEMO_PROJECTS } from "@/lib/demo-data";
import { NewProjectModal } from "./new-project-modal";

export function Sidebar() {
  const { session, isDemo } = useAuth();
  const { projects, active, loading, loadProjects, selectProject, setProjects } =
    useProjectStore();
  const resetInbox = useInboxStore((s) => s.reset);
  const resetDone = useDoneStore((s) => s.reset);
  const resetArchive = useArchiveStore((s) => s.reset);
  const resetBiz = useBizStore((s) => s.reset);
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (isDemo) {
      setProjects(DEMO_PROJECTS);
      if (!active) selectProject(DEMO_PROJECTS[0]);
    } else if (session?.access_token) {
      loadProjects(session.access_token);
    }
  }, [session?.access_token, isDemo, loadProjects, setProjects, selectProject, active]);

  function handleSelect(project: (typeof projects)[number]) {
    // Reset all view stores so data reloads for the new project
    resetInbox();
    resetDone();
    resetArchive();
    resetBiz();
    selectProject(project);
    const defaultView =
      project.mode === "developer" ? "inbox" : "overview";
    const params = isDemo ? "?demo" : "";
    router.push(`/dashboard/${defaultView}${params}`);
  }

  return (
    <>
      <aside className="flex flex-col border-r border-border bg-bg h-full overflow-hidden">
        <div className="px-4 pt-5 pb-3">
          <span className="font-mono text-micro text-text3 uppercase tracking-[0.14em]">
            My Projects
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-2">
          {loading ? (
            <div className="px-2 py-3">
              <div className="h-8 bg-surface rounded animate-pulse mb-2" />
              <div className="h-8 bg-surface rounded animate-pulse" />
            </div>
          ) : projects.length === 0 ? (
            <p className="px-2 py-3 font-mono text-footnote text-text3">
              No projects yet.
            </p>
          ) : (
            projects.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelect(p)}
                className={`
                  w-full flex items-center gap-2.5 px-3 py-2.5 rounded text-left
                  transition-colors duration-[180ms] cursor-pointer mb-0.5
                  ${
                    active?.id === p.id
                      ? "bg-surface border border-border text-text"
                      : "text-text2 hover:bg-surface/50 border border-transparent"
                  }
                `}
              >
                <span className="text-[1rem] shrink-0">
                  {p.mode === "developer" ? "🔧" : "🏪"}
                </span>
                <span className="font-mono text-footnote truncate">
                  {p.name}
                </span>
              </button>
            ))
          )}
        </div>

        <div className="px-3 py-4 border-t border-border">
          <button
            onClick={() => setModalOpen(true)}
            className="w-full font-mono text-footnote text-text3 hover:text-text2
                       transition-colors py-2 cursor-pointer text-left px-1"
          >
            + New Project
          </button>
        </div>
      </aside>

      <NewProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
