"use client";

import Link from "next/link";
import { WaitlistForm } from "@/components/landing/waitlist-form";

export function Footer() {
  return (
    <footer
      className="relative border-t border-border px-8 max-md:px-5 py-20 max-md:py-14"
      aria-label="Footer"
    >
      <div className="mx-auto max-w-[960px] flex flex-col gap-16 max-md:gap-10">
        {/* Inline waitlist — last chance to capture */}
        <div className="flex items-start gap-12 max-md:flex-col max-md:gap-5">
          <div className="min-w-[280px] max-w-[400px]">
            <span className="block font-mono text-caption text-text3 uppercase mb-3">
              Not ready?
            </span>
            <p
              className="font-serif font-normal text-text [text-wrap:balance]"
              style={{
                fontSize: "clamp(1.25rem, 2vw, 1.5rem)",
                lineHeight: 1.25,
              }}
            >
              Join the paid-tier <em className="text-text2">waitlist.</em>
            </p>
          </div>
          <div className="flex-1 w-full pt-3 max-md:pt-0">
            <WaitlistForm />
          </div>
        </div>

        {/* Signature */}
        <div className="flex items-end justify-between gap-6 max-md:flex-col max-md:items-start max-md:gap-6">
          <div>
            <span
              className="block font-serif italic text-text"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.25rem)", letterSpacing: "-0.02em" }}
            >
              Grova
            </span>
            <span className="block mt-2 font-mono text-caption text-text3 uppercase">
              Feedback, considered.
            </span>
          </div>
          <nav className="flex items-center gap-6 max-md:gap-4 flex-wrap">
            <Link
              href="/docs"
              className="font-mono text-footnote text-text3 hover:text-text2 transition-colors"
            >
              Docs
            </Link>
            <Link
              href="/about"
              className="font-mono text-footnote text-text3 hover:text-text2 transition-colors"
            >
              About
            </Link>
            <Link
              href="/privacy"
              className="font-mono text-footnote text-text3 hover:text-text2 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="font-mono text-footnote text-text3 hover:text-text2 transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/login"
              className="font-mono text-footnote text-text3 hover:text-text2 transition-colors"
            >
              Login
            </Link>
          </nav>
        </div>

        <div className="font-mono text-caption text-text3">
          © {new Date().getFullYear()} Grova
        </div>
      </div>
    </footer>
  );
}
