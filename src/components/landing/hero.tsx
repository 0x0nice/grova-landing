"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useTrack } from "@/hooks/use-track";

const crossfade = {
  initial: { y: 6 },
  animate: { y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.24, ease: "easeOut" as const },
};

function DecisionArtifact({ track }: { track: "dev" | "biz" }) {
  const developer = track === "dev";

  return (
    <aside
      className="decision-artifact mt-14 bg-surface-raised px-7 py-7 pr-12 max-md:mt-10 max-md:px-5 max-md:py-6 max-md:pr-10"
      aria-label={developer ? "Example developer decision brief" : "Example business decision brief"}
    >
      <div className="grid grid-cols-[150px_1fr_1fr] gap-8 items-start max-lg:grid-cols-[120px_1fr] max-lg:[&>*:last-child]:col-start-2 max-md:grid-cols-1 max-md:gap-6 max-md:[&>*:last-child]:col-start-1">
        <div>
          <p className="text-[0.72rem] text-text3 mb-1">Decision score</p>
          <p className={`font-serif text-[4.3rem] leading-[0.9] tabular-nums ${developer ? "text-orange" : "text-accent"}`}>
            {developer ? "9.2" : "8.6"}
          </p>
          <p className="text-[0.72rem] text-text2 mt-3">
            {developer ? "Ship-blocking" : "Retention risk"}
          </p>
        </div>

        <div>
          <p className="text-[0.72rem] text-text3 mb-2">What the evidence says</p>
          <h2 className="font-serif text-[1.45rem] text-text leading-[1.15] mb-3">
            {developer ? "Revenue-blocking checkout failure" : "Friday wait times are becoming a pattern"}
          </h2>
          <p className="text-[0.84rem] text-text2 leading-[1.65]">
            {developer
              ? "Payment intent creation fails when customer identity is missing. Three console signals point to payment-service.js:89."
              : "Three guests reported waits above twenty minutes. Two said the delay changed whether they would return."}
          </p>
        </div>

        <div>
          <p className="text-[0.72rem] text-text3 mb-2">The next move</p>
          <p className="font-serif text-[1.25rem] text-text leading-[1.35]">
            {developer
              ? "Repair customer lookup, add a visible failure state, and open the issue with the captured evidence attached."
              : "Reply to the affected guests and add one host to Friday's 6 to 8 PM shift."}
          </p>
          <p className="text-[0.7rem] text-text3 mt-5">
            {developer ? "3 console errors · Chrome 121 · 2 hours ago" : "3 related messages · High confidence · This week"}
          </p>
        </div>
      </div>
    </aside>
  );
}

export function Hero() {
  const { track } = useTrack();

  return (
    <section className="min-h-[calc(100svh-92px)] py-[68px] flex items-center max-md:min-h-0 max-md:py-[52px]">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={track} {...crossfade} className="w-full">
          <div className="grid grid-cols-12 gap-x-8 gap-y-8 items-end max-lg:grid-cols-1">
            <h1 className="col-span-8 font-serif text-[clamp(3.3rem,7vw,5.75rem)] leading-[0.92] tracking-[-0.025em] text-text font-normal max-lg:col-span-1 [text-wrap:balance]">
              {track === "dev" ? (
                <>Feedback in.<br /><span className="text-text2">A decision out.</span></>
              ) : (
                <>Hear patterns.<br /><span className="text-text2">Act early.</span></>
              )}
            </h1>

            <div className="col-span-4 pb-2 max-lg:col-span-1 max-lg:max-w-[620px]">
              <p className="text-[1rem] text-text2 leading-[1.75] mb-6 [text-wrap:pretty]">
                {track === "dev"
                  ? "Grova turns a vague report into ranked evidence, likely cause, priority, and the next action your team should take."
                  : "Collect private feedback through your site or QR code. Grova connects recurring themes, flags retention risk, and prepares the right response."}
              </p>
              <Link
                href="/login?mode=signup"
                className={`${track === "dev" ? "bg-orange hover:bg-[#ad4d19]" : "bg-accent hover:bg-[#356448]"} inline-flex rounded px-6 py-3 text-[0.9rem] font-semibold text-white no-underline transition-colors`}
              >
                {track === "dev" ? "Start with real feedback" : "Start listening"}
              </Link>
            </div>
          </div>

          <DecisionArtifact track={track} />
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
