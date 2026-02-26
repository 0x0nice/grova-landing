"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/providers/auth-provider";
import { useProjectStore } from "@/stores/project-store";
import { useInboxStore } from "@/stores/inbox-store";
import { useDoneStore } from "@/stores/done-store";
import { useArchiveStore } from "@/stores/archive-store";
import { useBizStore } from "@/stores/biz-store";
import { DEMO_PROJECTS } from "@/lib/demo-data";
import { NewProjectModal } from "./new-project-modal";

interface Tab {
  view: string;
  label: string;
  countKey?: "inbox" | "done" | "archive";
}

const devTabs: Tab[] = [
  { view: "inbox", label: "Inbox", countKey: "inbox" },
  { view: "done", label: "Approved", countKey: "done" },
  { view: "archive", label: "Denied", countKey: "archive" },
  { view: "settings", label: "Settings" },
  { view: "billing", label: "Billing" },
];

const bizTabs: Tab[] = [
  { view: "overview", label: "Overview" },
  { view: "categories", label: "Categories" },
  { view: "trends", label: "Trends" },
  { view: "setup", label: "Setup" },
  { view: "billing", label: "Billing" },
];

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, signOut, isDemo } = useAuth();
  const {
    projects,
    active,
    loading: projectsLoading,
    loadProjects,
    selectProject,
    setProjects,
  } = useProjectStore();
  const inboxCount = useInboxStore((s) => s.items.length);
  const resetInbox = useInboxStore((s) => s.reset);
  const doneCount = useDoneStore((s) => s.items.length);
  const resetDone = useDoneStore((s) => s.reset);
  const archiveCount = useArchiveStore((s) => s.items.length);
  const resetArchive = useArchiveStore((s) => s.reset);
  const resetBiz = useBizStore((s) => s.reset);

  const counts: Record<string, number> = {
    inbox: inboxCount,
    done: doneCount,
    archive: archiveCount,
  };

  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const tabs = active?.mode === "business" ? bizTabs : devTabs;
  const currentView = pathname.split("/").pop() || "inbox";

  // Load projects (moved from Sidebar)
  useEffect(() => {
    if (isDemo) {
      setProjects(DEMO_PROJECTS);
      if (!active) selectProject(DEMO_PROJECTS[0]);
    } else if (session?.access_token) {
      loadProjects(session.access_token);
    }
  }, [session?.access_token, isDemo, loadProjects, setProjects, selectProject, active]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setProjectMenuOpen(false);
      }
    }
    if (projectMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [projectMenuOpen]);

  function handleTabClick(view: string) {
    const params = isDemo ? "?demo" : "";
    router.push(`/dashboard/${view}${params}`);
  }

  function handleProjectSwitch(project: (typeof projects)[number]) {
    resetInbox();
    resetDone();
    resetArchive();
    resetBiz();
    selectProject(project);
    setProjectMenuOpen(false);
    const defaultView = project.mode === "developer" ? "inbox" : "overview";
    const params = isDemo ? "?demo" : "";
    router.push(`/dashboard/${defaultView}${params}`);
  }

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  function handleRefresh() {
    window.location.reload();
  }

  return (
    <>
      <nav className="relative z-40 flex flex-col border-b border-border bg-bg shrink-0 md:flex-row md:items-center md:h-16">
        {/* Top row (always visible) */}
        <div className="flex items-center h-12 px-5 gap-4 max-md:gap-2 max-md:px-3 md:h-16 md:flex-1">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0 max-md:mr-0 mr-2">
            <Logo size="md" href="/dashboard" />
            <span className="font-mono text-micro text-text3 uppercase tracking-[0.1em] max-md:hidden">
              dashboard
            </span>
          </div>

          {/* Tabs — hidden on mobile, shown inline on md+ */}
          <div
            className="hidden md:flex items-center gap-1 overflow-x-auto scrollbar-none"
            role="tablist"
          >
            {tabs.map((tab) => {
              const isActive = currentView === tab.view;
              return (
                <button
                  key={tab.view}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleTabClick(tab.view)}
                  className={`
                    font-mono text-footnote uppercase tracking-[0.04em]
                    px-3 py-2 rounded transition-colors duration-[180ms] cursor-pointer
                    whitespace-nowrap
                    ${
                      isActive
                        ? "bg-surface text-text border border-border"
                        : "text-text3 hover:text-text2 border border-transparent"
                    }
                  `}
                >
                  {tab.label}
                  {tab.countKey && counts[tab.countKey] > 0 && (
                    <span className="ml-1.5 text-text3">{counts[tab.countKey]}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right section */}
          <div className="ml-auto flex items-center gap-1.5 shrink-0">
            {/* Project dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setProjectMenuOpen(!projectMenuOpen)}
                className={`flex items-center gap-2 font-mono text-footnote px-3 py-2
                           rounded border transition-colors duration-[180ms] cursor-pointer
                           max-md:px-2 max-md:py-1.5 max-md:text-micro
                           ${
                             projectMenuOpen
                               ? "bg-surface border-border text-text"
                               : "border-transparent text-text2 hover:text-text hover:bg-surface/50"
                           }`}
              >
                <span className="text-[0.9rem] shrink-0 max-md:text-[0.8rem]">
                  {active?.mode === "developer" ? "🔧" : "🏪"}
                </span>
                <span className="truncate max-w-[140px] max-md:max-w-[80px]">
                  {projectsLoading ? "Loading..." : active?.name || "Select project"}
                </span>
                <svg
                  className={`w-3 h-3 text-text3 transition-transform duration-150 shrink-0 ${
                    projectMenuOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {projectMenuOpen && (
                <div className="absolute top-full right-0 mt-1.5 bg-surface border border-border rounded-lg shadow-lg z-50 min-w-[220px] py-1 max-md:right-auto max-md:left-0">
                  {projects.length === 0 && !projectsLoading && (
                    <div className="px-3 py-2 font-mono text-micro text-text3">
                      No projects yet
                    </div>
                  )}
                  {projects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleProjectSwitch(p)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left font-mono text-footnote
                                  transition-colors cursor-pointer
                                  ${
                                    active?.id === p.id
                                      ? "text-text bg-bg"
                                      : "text-text2 hover:bg-bg hover:text-text"
                                  }`}
                    >
                      <span className="text-[0.9rem] shrink-0">
                        {p.mode === "developer" ? "🔧" : "🏪"}
                      </span>
                      <span className="truncate">{p.name}</span>
                      {active?.id === p.id && (
                        <svg className="w-3.5 h-3.5 text-accent ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                  <div className="border-t border-border mt-1 pt-1">
                    <button
                      onClick={() => {
                        setProjectMenuOpen(false);
                        setModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left font-mono text-footnote
                                 text-accent hover:bg-bg transition-colors cursor-pointer"
                    >
                      <span className="text-[0.9rem] shrink-0">+</span>
                      <span>New Project</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="w-px h-5 bg-border mx-0.5 max-md:hidden" />

            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded
                         font-mono text-micro uppercase tracking-[0.04em]
                         text-text3 hover:text-text2 hover:bg-surface/50
                         border border-transparent hover:border-border
                         transition-colors duration-[180ms] cursor-pointer
                         max-md:px-2 max-md:py-1.5"
              title="Refresh data"
              aria-label="Refresh data"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="max-md:hidden">Refresh</span>
            </button>

            <ThemeToggle />

            {/* Sign out button */}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded
                         font-mono text-micro uppercase tracking-[0.04em]
                         text-text3 hover:text-red hover:bg-red/5
                         border border-transparent hover:border-red/20
                         transition-colors duration-[180ms] cursor-pointer
                         max-md:px-2 max-md:py-1.5"
              title="Sign out"
              aria-label="Sign out"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="max-md:hidden">Sign out</span>
            </button>
          </div>
        </div>

        {/* Mobile tab row — scrollable horizontal tabs */}
        <div
          className="flex md:hidden items-center gap-1 px-3 pb-2 overflow-x-auto scrollbar-none"
          role="tablist"
        >
          {tabs.map((tab) => {
            const isActive = currentView === tab.view;
            return (
              <button
                key={tab.view}
                role="tab"
                aria-selected={isActive}
                onClick={() => handleTabClick(tab.view)}
                className={`
                  font-mono text-footnote uppercase tracking-[0.04em]
                  px-3 py-1.5 rounded transition-colors duration-[180ms] cursor-pointer
                  whitespace-nowrap
                  ${
                    isActive
                      ? "bg-surface text-text border border-border"
                      : "text-text3 hover:text-text2 border border-transparent"
                  }
                `}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      <NewProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
