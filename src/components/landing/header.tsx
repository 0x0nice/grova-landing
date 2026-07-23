"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { TrackToggle } from "./track-toggle";

export function Header() {
  const btnText = "text-white";

  return (
    <header className="sticky top-0 z-100 bg-bg transition-colors duration-[180ms]">
      <nav className="max-w-[1120px] mx-auto px-10 max-md:px-5">
        {/* Desktop header: preserve the existing one-line composition. */}
        <div className="hidden md:flex py-6 items-center justify-between">
          <div className="flex items-center">
            <Logo size="lg" href="/" />
            <TrackToggle />
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/docs" className="text-text2 text-[0.78rem] font-medium px-2 py-2 no-underline transition-colors hover:text-text">
              Docs
            </Link>
            <Link href="/dashboard/inbox?demo" className="text-text2 text-[0.78rem] font-medium px-2 py-2 no-underline transition-colors hover:text-text">
              Demo
            </Link>
            <Link href="/login" className="text-text2 text-[0.78rem] font-medium px-2 py-2 no-underline transition-colors hover:text-text">
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
              Create account
            </Link>
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile header: actions share the logo row; the mode switch sits below it. */}
        <div className="grid gap-y-3 py-4 md:hidden">
          <div className="flex items-center justify-between gap-3">
            <Logo size="md" href="/" />

            <div className="flex shrink-0 items-center gap-1.5">
              <Link
                href="/dashboard/inbox?demo"
                className="text-text2 text-[0.72rem] font-medium px-1.5 py-2 no-underline transition-colors hover:text-text"
              >
                Demo
              </Link>
              <Link
                href="/login?mode=signup"
                className={`bg-[var(--track-accent)] ${btnText} border border-[var(--track-accent)]
                           rounded px-3 py-2
                           text-[0.72rem] font-semibold
                           no-underline inline-flex items-center
                           transition-colors duration-[180ms]
                           hover:brightness-90`}
              >
                Create<span className="max-[374px]:hidden">&nbsp;account</span>
              </Link>
              <ThemeToggle />
            </div>
          </div>

          <div className="justify-self-start">
            <TrackToggle showLabel={false} mobile />
          </div>
        </div>
      </nav>
    </header>
  );
}
