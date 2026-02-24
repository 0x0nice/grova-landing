"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTrack } from "@/hooks/use-track";
import { WaitlistForm } from "./waitlist-form";

// CSS fade-up for initial page load (works without JS).
// framer-motion is only used for the dev↔biz crossfade transition.
function fadeUp(delayMs: number): { style: React.CSSProperties } {
  return {
    style: {
      animation: `fadeUp 0.5s ease-out ${delayMs}ms both`,
    },
  };
}

const crossfade = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.28, ease: "easeOut" as const },
};

export function Hero() {
  const { track } = useTrack();

  return (
    <section className="pt-[108px] pb-[88px] max-w-[680px] max-md:pt-[60px] max-md:pb-[52px]">
      <AnimatePresence mode="wait">
        {track === "dev" ? (
          <motion.div key="dev" {...crossfade}>
            <span
              {...fadeUp(50)}
              className="block text-[0.64rem] tracking-[0.16em] uppercase mb-[34px] text-accent"
            >
              Feedback triage for developers
            </span>
            <h1
              {...fadeUp(150)}
              className="font-serif text-[clamp(2.8rem,6vw,4.6rem)] leading-[1.07] tracking-[-0.025em] text-text font-normal mb-[26px]"
            >
              Better feedback.
              <br />
              <em className="text-text2">Faster fixes.</em>
            </h1>
            <p
              {...fadeUp(250)}
              className="text-[0.94rem] text-text2 leading-[1.85] max-w-[500px] mb-[44px] font-light"
            >
              Grova captures user feedback, filters the noise, and delivers ranked
              fix briefs straight to your inbox — ready to drop into Cursor or
              Claude Code. You stay in control. Your AI does the work.
            </p>
            <div {...fadeUp(350)}>
              <WaitlistForm />
              <p className="mt-2.5 text-[0.62rem] text-text3 tracking-[0.04em]">
                No spam. Unsubscribe any time.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div key="biz" {...crossfade}>
            <span
              {...fadeUp(50)}
              className="block text-[0.64rem] tracking-[0.16em] uppercase mb-[34px] text-orange"
            >
              Grova for Business
            </span>
            <h1
              {...fadeUp(150)}
              className="font-serif text-[clamp(2.8rem,6vw,4.6rem)] leading-[1.07] tracking-[-0.025em] text-text font-normal mb-[26px]"
            >
              Know what your customers think.
              <br />
              <em className="text-text2">Without guessing.</em>
            </h1>
            <p
              {...fadeUp(250)}
              className="text-[0.94rem] text-text2 leading-[1.85] max-w-[500px] mb-[44px] font-light"
            >
              Replace your contact form with something that actually tells you
              what customers care about. A lightweight widget on your site.
              Plain-English summaries every week. No spreadsheets. No jargon. Just
              answers.
            </p>
            <div {...fadeUp(350)}>
              <WaitlistForm />
              <p className="mt-2.5 text-[0.62rem] text-text3 tracking-[0.04em]">
                Simple flat-rate pricing, coming soon.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
