"use client";

import Link from "next/link";
import { useTrack } from "@/hooks/use-track";
import { WaitlistForm } from "./waitlist-form";

export function CTASection() {
  const { track } = useTrack();
  const accentBg = track === "biz" ? "bg-accent text-black" : "bg-orange text-white";

  return (
    <section className="py-24 text-center" id="waitlist">
      {track === "dev" ? (
        <>
          <h2 className="font-serif text-[clamp(1.75rem,3.2vw,2.6rem)] font-normal tracking-[-0.025em] leading-[1.1] text-text max-w-[500px] mx-auto mb-3.5">
            Your product,
            <br />
            <em className="text-text2">always improving.</em>
          </h2>
          <p className="text-body text-text2 mb-[34px] font-light leading-[1.75]">
            Start free today. No credit card required.
          </p>
        </>
      ) : (
        <>
          <h2 className="font-serif text-[clamp(1.75rem,3.2vw,2.6rem)] font-normal tracking-[-0.025em] leading-[1.1] text-text max-w-[500px] mx-auto mb-3.5">
            Your customers are already talking.
            <br />
            <em className="text-text2">Start listening.</em>
          </h2>
          <p className="text-body text-text2 mb-[34px] font-light leading-[1.75]">
            Start free today. No credit card required.
          </p>
        </>
      )}

      <div className="flex flex-col items-center gap-6">
        <Link
          href="/login?mode=signup"
          className={`${accentBg} rounded px-8 py-3
                     font-mono text-footnote font-semibold tracking-[0.04em]
                     no-underline inline-flex items-center gap-2
                     transition-opacity duration-[180ms] hover:opacity-85`}
        >
          Get started free →
        </Link>
        <div className="flex items-center gap-3 text-text3">
          <span className="h-px w-8 bg-border" />
          <span className="font-mono text-caption uppercase tracking-[0.12em]">or join the paid-tier waitlist</span>
          <span className="h-px w-8 bg-border" />
        </div>
        <WaitlistForm className="flex justify-center" />
      </div>
    </section>
  );
}
