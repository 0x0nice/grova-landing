"use client";

import { useTrack } from "@/hooks/use-track";
import { WaitlistForm } from "./waitlist-form";

export function CTASection() {
  const { track } = useTrack();

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
            Join the waitlist. Early access and founding member pricing.
          </p>
        </>
      ) : (
        <>
          <h2 className="font-serif text-[clamp(1.75rem,3.2vw,2.6rem)] font-normal tracking-[-0.025em] leading-[1.1] text-text max-w-[500px] mx-auto mb-3.5">
            Ready to hear what your
            <br />
            <em className="text-text2">customers are saying?</em>
          </h2>
          <p className="text-body text-text2 mb-[34px] font-light leading-[1.75]">
            Join the waitlist. Free to start — paid plans from $19/mo.
          </p>
        </>
      )}
      <WaitlistForm className="flex justify-center" />
    </section>
  );
}
