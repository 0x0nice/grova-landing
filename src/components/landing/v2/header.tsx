"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 120);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-[background,border-color,backdrop-filter] duration-[240ms] ${
        scrolled
          ? "bg-bg/70 backdrop-blur-md border-b border-border/60"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="max-w-[1280px] mx-auto px-10 max-md:px-5 py-6 max-md:py-4 flex items-center justify-between">
        <Logo size="lg" href="/" />
        <div className="flex items-center gap-5 max-md:gap-3">
          <Link
            href="/dashboard/inbox?demo"
            className="font-mono text-footnote text-text3 hover:text-text2 transition-colors uppercase max-md:hidden"
          >
            Try the demo →
          </Link>
          <Link
            href="/docs"
            className="font-mono text-footnote text-text3 hover:text-text2 transition-colors uppercase max-md:hidden"
          >
            Docs
          </Link>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
