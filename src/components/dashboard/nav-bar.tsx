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
];

const bizTabs: Tab[] = [
  { view: "overview", label: "Overview" },
  { view: "categories", label: "Categories" },
  { view: "trends", label: "Trends" },
  { view: "setup", label: "Setup" },
];

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut, isDemo } = useAuth();
  const { projects, active, selectProject } = useProjectStore();
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
  const menuRef = useRef<HTMLDivElement>(null);

  const tabs = active?.mode === "business" ? bizTabs : devTabs;
  const currentView = pathname.split("/").pop() || "inbox";

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
    <nav className="flex flex-col border-b border-border bg-bg shrink-0 md:flex-row md:items-center md:h-16">
      {/* Top row (always visible) */}
      <div className="flex items-center h-12 px-5 gap-4 md:h-16 md:flex-1">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0 mr-2">
          <Logo size="sm" href="/dashboard" />
          <span className="font-mono text-micro text-text3 uppercase tracking-[0.1em]">
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

        {/* Mobile project switcher */}
        {projects.length > 1 && (
          <div className="relative md:hidden" ref={menuRef}>
            <button
              onClick={() => setProjectMenuOpen(!projectMenuOpen)}
              className="flex items-center gap-1.5 font-mono text-micro text-text2 px-2 py-1 rounded border border-border bg-surface cursor-pointer"
            >
              <span>{active?.mode === "developer" ? "🔧" : "🏪"}</span>
              <span className="truncate max-w-[100px]">{active?.name}</span>
              <span className="text-text3">▾</span>
            </button>
            {projectMenuOpen && (
              <div className="absolute top-full left-0 mt-1 bg-surface border border-border rounded z-50 min-w-[180px]">
                {projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleProjectSwitch(p)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left font-mono text-footnote transition-colors cursor-pointer ${
                      active?.id === p.id ? "text-text bg-bg" : "text-text2 hover:bg-bg"
                    }`}
                  >
                    <span>{p.mode === "developer" ? "🔧" : "🏪"}</span>
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Right section */}
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <button
            onClick={handleRefresh}
            className="p-2 text-text3 hover:text-text2 transition-colors font-mono text-callout cursor-pointer"
            title="Refresh"
          >
            ↺
          </button>
          <ThemeToggle />
          <button
            onClick={handleSignOut}
            className="font-mono text-footnote text-text3 hover:text-text2 transition-colors uppercase tracking-[0.04em] px-3 py-2 cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Mobile tab row — scrollable horizontal tabs */}
      <div
        className="flex md:hidden items-center gap-1 px-5 pb-2 overflow-x-auto scrollbar-none"
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
  );
}
