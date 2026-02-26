"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { TrackToggle } from "./track-toggle";
import { useTrack } from "@/hooks/use-track";

export function Header() {
  const { track } = useTrack();
  const btnText = track === "biz" ? "text-black" : "text-white";

  return (
    <header className="sticky top-0 z-100 bg-bg border-b border-border transition-colors duration-[180ms]">
      <nav className="max-w-[980px] mx-auto px-10 max-md:px-5 py-7 max-md:py-4 flex flex-wrap items-center justify-between gap-y-3">
        {/* Left: logo + track toggle (desktop only) */}
        <div className="flex items-center">
          <Logo size="lg" href="/" />
          <span className="max-md:hidden">
            <TrackToggle />
          </span>
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/login?mode=signup"
            className={`bg-[var(--track-accent)] ${btnText} border border-[var(--track-accent)]
                       rounded px-3.5 py-1.5
                       font-mono text-[0.65rem] font-semibold tracking-[0.04em]
                       no-underline inline-flex items-center gap-1.5
                       transition-opacity duration-[180ms] hover:opacity-85`}
          >
            Get Started
          </Link>
          <Link
            href="/dashboard/inbox?demo"
            className="bg-transparent border border-border2 rounded
                       text-text2 cursor-pointer font-mono text-[0.65rem] font-medium
                       tracking-[0.04em] px-3 py-1.5 no-underline
                       inline-flex items-center gap-1.5
                       transition-colors duration-[180ms]
                       hover:border-[var(--track-accent)] hover:text-[var(--track-accent)]"
          >
            Try Demo
          </Link>
          <Link
            href="/login"
            className="bg-transparent border border-border2 rounded
                       text-text2 cursor-pointer font-mono text-[0.65rem] font-medium
                       tracking-[0.04em] px-3 py-1.5 no-underline
                       inline-flex items-center gap-1.5
                       transition-colors duration-[180ms]
                       hover:border-[var(--track-accent)] hover:text-[var(--track-accent)]
                       max-md:hidden"
          >
            Login <span className="text-[0.7rem] transition-transform duration-150 group-hover:translate-x-0.5">→</span>
          </Link>
          <ThemeToggle />
        </div>

        {/* Mobile only: track toggle on its own centered row */}
        <div className="w-full flex justify-center md:hidden">
          <TrackToggle />
        </div>
      </nav>
    </header>
  );
}
