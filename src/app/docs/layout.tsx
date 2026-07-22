"use client";

import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Link from "next/link";
import { usePathname } from "next/navigation";

const sidebarLinks = [
  { href: "/docs", label: "Overview" },
  { href: "/docs/getting-started", label: "Getting Started" },
  { href: "/docs/widget", label: "Widget Installation" },
  { href: "/docs/api", label: "API Reference" },
  { href: "/docs/smart-actions", label: "Smart Actions" },
  { href: "/docs/scoring", label: "Scoring System" },
];

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <nav className="flex items-center justify-between px-10 py-6 max-md:px-5">
        <Logo size="lg" />
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="font-mono text-footnote text-text3 hover:text-text2 transition-colors"
          >
            Back
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      {/* Mobile horizontal nav */}
      <div className="md:hidden overflow-x-auto border-b border-border px-5">
        <div className="flex items-center gap-4 py-3 min-w-max">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`font-mono text-footnote whitespace-nowrap transition-colors ${
                pathname === link.href
                  ? "text-text"
                  : "text-text3 hover:text-text2"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex-1 flex max-w-[960px] w-full mx-auto px-10 max-md:px-5 py-12 gap-12">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-[200px] shrink-0">
          <nav className="flex flex-col gap-2 sticky top-24">
            {sidebarLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-mono text-footnote transition-colors ${
                  pathname === link.href
                    ? "text-text"
                    : "text-text3 hover:text-text2"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
