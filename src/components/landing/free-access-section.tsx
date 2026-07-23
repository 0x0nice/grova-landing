"use client";

import Link from "next/link";
import { useTrack } from "@/hooks/use-track";

export function FreeAccessSection() {
  const { track } = useTrack();
  const developer = track === "dev";

  return (
    <section className="py-[88px] max-md:py-[64px]" aria-labelledby="free-access-title">
      <div className="grid grid-cols-12 items-end gap-x-8 gap-y-8 max-lg:grid-cols-1">
        <h2
          id="free-access-title"
          className="col-span-8 max-w-[800px] font-serif text-[clamp(2.7rem,6vw,5rem)] font-normal leading-[0.96] tracking-[-0.03em] text-text max-lg:col-span-1"
        >
          Grova is free for now.
        </h2>

        <div className="col-span-4 pb-1 max-w-[520px] max-lg:col-span-1">
          <p className="mb-6 text-[0.92rem] leading-[1.75] text-text2">
            We are building it with real teams, and everything available in this preview is included.{" "}
            {developer
              ? "Create an account, connect a product, and run real feedback through the full decision loop."
              : "Create an account, open a feedback channel, and start learning from real customer signals."}
          </p>
          <Link
            href="/login?mode=signup"
            className={`${developer ? "bg-orange hover:bg-[#ad4d19]" : "bg-accent hover:bg-[#356448]"} inline-flex rounded px-6 py-3 text-[0.9rem] font-semibold text-white no-underline transition-colors`}
          >
            Create account
          </Link>
        </div>
      </div>
    </section>
  );
}
