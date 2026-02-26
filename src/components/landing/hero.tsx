"use client";

import Link from "next/link";
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
              className="block text-[0.64rem] tracking-[0.16em] uppercase mb-[34px] text-orange"
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
              className="block text-[0.64rem] tracking-[0.16em] uppercase mb-[34px] text-accent"
            >
              Smart feedback for your business
            </span>
            <h1
              {...fadeUp(150)}
              className="font-serif text-[clamp(2.8rem,6vw,4.6rem)] leading-[1.07] tracking-[-0.025em] text-text font-normal mb-[26px]"
            >
              Your customers have something to say.
              <br />
              <em className="text-text2">Make it easy to hear them.</em>
            </h1>
            <p
              {...fadeUp(250)}
              className="text-[0.94rem] text-text2 leading-[1.85] max-w-[540px] mb-[44px] font-light"
            >
              Grova makes it easy for customers to share honest feedback — through
              a widget on your site, a QR code at your register, or a simple
              link. AI filters the noise and surfaces what actually matters. No
              dashboards to learn. No data to crunch. Just a weekly brief in your
              inbox telling you what to fix, what&apos;s working, and what your
              customers really think.
            </p>
            <div {...fadeUp(350)} className="flex items-center gap-4 flex-wrap">
              <Link
                href="/login?mode=signup"
                className="bg-accent text-black rounded px-6 py-3
                           font-mono text-[0.75rem] font-semibold tracking-[0.04em]
                           no-underline inline-flex items-center gap-2
                           transition-opacity duration-[180ms] hover:opacity-85"
              >
                Start free →
              </Link>
              <a
                href="#pipeline"
                className="text-[0.76rem] text-text2 font-light hover:text-accent transition-colors"
              >
                See how it works ↓
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
