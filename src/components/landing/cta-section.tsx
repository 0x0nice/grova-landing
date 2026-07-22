"use client";

import Link from "next/link";
import { useTrack } from "@/hooks/use-track";
import { WaitlistForm } from "./waitlist-form";

export function CTASection() {
  const { track } = useTrack();
  const developer = track === "dev";

  return (
    <section className="my-20 bg-surface px-8 py-10 max-md:my-14 max-md:px-5" id="waitlist">
      <div className="grid grid-cols-[1.1fr_0.9fr] gap-16 items-end max-md:grid-cols-1 max-md:gap-10">
        <div>
          <h2 className="font-serif text-[clamp(2.2rem,5vw,4.5rem)] font-normal tracking-[-0.03em] leading-[0.95] text-text max-w-[700px] mb-7">
            {developer ? "Put one real report through the loop." : "Give one customer a better place to be heard."}
          </h2>
          <Link
            href="/login?mode=signup"
            className={`${developer ? "bg-orange hover:bg-[#ad4d19]" : "bg-accent hover:bg-[#356448]"} inline-flex rounded px-7 py-3 text-[0.9rem] font-semibold text-white no-underline transition-colors`}
          >
            Start free
          </Link>
        </div>

        <div>
          <p className="text-[0.84rem] text-text2 leading-[1.65] mb-5">
            Paid plans are opening in stages. Leave your email if you want early access when the workflow fits your team.
          </p>
          <WaitlistForm />
        </div>
      </div>
    </section>
  );
}
