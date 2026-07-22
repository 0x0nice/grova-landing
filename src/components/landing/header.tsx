"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { TrackToggle } from "./track-toggle";

export function Header() {
  const btnText = "text-white";

  return (
    <header className="sticky top-0 z-100 bg-bg transition-colors duration-[180ms]">
      <nav className="max-w-[1120px] mx-auto px-10 max-md:px-5 py-6 max-md:py-4 flex flex-wrap items-center justify-between gap-y-3">
        {/* Left: logo + track toggle (desktop only) */}
        <div className="flex items-center">
          <Logo size="lg" href="/" />
          <span className="max-md:hidden">
            <TrackToggle />
          </span>
        </div>

        {/* Right: action buttons */}
        <div className="flex items-center gap-2.5">
          <Link href="/docs" className="text-text2 text-[0.78rem] font-medium px-2 py-2 no-underline transition-colors hover:text-text max-md:hidden">
            Docs
          </Link>
          <Link href="/dashboard/inbox?demo" className="text-text2 text-[0.78rem] font-medium px-2 py-2 no-underline transition-colors hover:text-text">
            Demo
          </Link>
          <Link href="/login" className="text-text2 text-[0.78rem] font-medium px-2 py-2 no-underline transition-colors hover:text-text max-md:hidden">
            Log in
          </Link>
          <Link
            href="/login?mode=signup"
            className={`bg-[var(--track-accent)] ${btnText} border border-[var(--track-accent)]
                       rounded px-3.5 py-1.5
                       text-[0.78rem] font-semibold
                       no-underline inline-flex items-center gap-1.5
                       transition-colors duration-[180ms]
                       hover:brightness-90`}
          >
            Start free
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
