"use client";

import { motion } from "framer-motion";

// ---------- Content --------------------------------------------------------

const NOISE_INBOX: string[] = [
  "checkout broken on safari",
  "love the new update",
  "add dark mode",
  "this is terrible",
  "cant find settings",
  "crashes after 5min",
  "export to csv?",
  "best onboarding ever",
  "sso please",
  "billing page 404",
  "aaaaaaa",
  "doesn't work",
  "feature request: teams",
  "thanks for the fix!",
  "mobile view is tiny",
  "onboarding took 3 min",
  "why???",
  "dashboard slow on safari",
  "login loop forever",
  "broken on firefox",
  "payment failed silently",
  "import from slack?",
  "2fa please",
  "love it keep going",
];

// Curated ranked subset, with AI-generated-looking scores
const RANKED: { text: string; score: number }[] = [
  { text: "checkout broken on safari", score: 9.4 },
  { text: "billing page 404", score: 9.1 },
  { text: "login loop forever", score: 8.8 },
  { text: "payment failed silently", score: 8.6 },
  { text: "dashboard slow on safari", score: 8.2 },
  { text: "cant find settings", score: 7.9 },
  { text: "sso please", score: 7.6 },
  { text: "onboarding took 3 min", score: 7.3 },
];

const TOP_THREE = RANKED.slice(0, 3);

// ---------- Beat scaffold --------------------------------------------------

const fadeUp = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-20% 0px -20% 0px" },
  transition: { duration: 0.7, ease: [0.2, 0.7, 0.2, 1] as const },
};

function BeatShell({
  eyebrow,
  headline,
  caption,
  visual,
  reverse,
}: {
  eyebrow: string;
  headline: React.ReactNode;
  caption: string;
  visual: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <section className="relative min-h-screen flex items-center px-8 max-md:px-5 py-24 max-md:py-16">
      <div className="mx-auto w-full max-w-[1120px]">
        <div
          className={`grid grid-cols-2 gap-20 items-center max-lg:gap-12 max-md:grid-cols-1 max-md:gap-10 ${
            reverse ? "max-md:[&>*:first-child]:order-2" : ""
          }`}
        >
          <motion.div
            {...fadeUp}
            className={reverse ? "lg:order-2" : ""}
          >
            <span className="block font-mono text-caption text-text3 uppercase mb-5">
              {eyebrow}
            </span>
            <h2
              className="font-serif font-normal text-text [text-wrap:balance]"
              style={{
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                letterSpacing: "-0.025em",
                lineHeight: 1.05,
              }}
            >
              {headline}
            </h2>
            <p className="mt-6 max-w-[36ch] font-mono text-callout text-text3 font-light [text-wrap:pretty]">
              {caption}
            </p>
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
            className={reverse ? "lg:order-1" : ""}
          >
            {visual}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ---------- Visuals --------------------------------------------------------

function InboxNoise() {
  return (
    <div
      className="relative rounded-lg border border-border bg-bg2 p-5 [html[data-theme=dark]_&]:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
      aria-hidden="true"
    >
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
        <span className="font-mono text-caption text-text3 uppercase">
          Inbox · this week
        </span>
        <span className="font-mono text-caption text-text3 tabular-nums">
          847
        </span>
      </div>
      <ul className="flex flex-col gap-2.5 max-h-[340px] overflow-hidden relative">
        {NOISE_INBOX.slice(0, 16).map((t, i) => (
          <li
            key={i}
            className="font-mono text-footnote text-text2 truncate"
            style={{ opacity: 0.45 + (i % 3) * 0.15 }}
          >
            <span className="text-text3 mr-3 tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            {t}
          </li>
        ))}
        {/* Fade-out at bottom to imply continuation */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-bg2 to-transparent pointer-events-none" />
      </ul>
    </div>
  );
}

function InboxRanked() {
  return (
    <div
      className="relative rounded-lg border border-border bg-bg2 p-5 [html[data-theme=dark]_&]:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
      aria-hidden="true"
    >
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
        <span className="font-mono text-caption text-text3 uppercase">
          Ranked · signal
        </span>
        <span className="font-mono text-caption uppercase tracking-[0.04em]">
          <span className="text-accent tabular-nums">42</span>
          <span className="text-text3"> / 847</span>
        </span>
      </div>
      <ul className="flex flex-col gap-2.5">
        {RANKED.map((item, i) => (
          <li
            key={i}
            className="flex items-baseline gap-4 font-mono text-footnote text-text"
          >
            <span className="w-10 shrink-0 text-right tabular-nums font-medium text-accent">
              {item.score.toFixed(1)}
            </span>
            <span className="truncate">{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EditorWithTopThree() {
  return (
    <div className="relative" aria-hidden="true">
      {/* Top 3 ranked items floating above */}
      <ul className="flex flex-col gap-2 mb-6">
        {TOP_THREE.map((r) => (
          <li
            key={r.text}
            className="flex items-baseline gap-3 font-mono text-footnote text-text2"
          >
            <span className="w-9 shrink-0 text-right tabular-nums font-medium text-accent">
              {r.score.toFixed(1)}
            </span>
            <span className="truncate">{r.text}</span>
          </li>
        ))}
      </ul>

      {/* Arrow */}
      <div className="flex justify-center mb-3">
        <span className="font-mono text-[0.62rem] text-text3 uppercase tracking-[0.28em]">
          ↓ brief.md
        </span>
      </div>

      {/* Editor silhouette */}
      <div className="relative w-full aspect-[16/10] max-w-[480px] bg-bg2 border border-border rounded-lg overflow-hidden [html[data-theme=dark]_&]:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="absolute left-0 top-0 bottom-0 w-14 bg-bg border-r border-border flex flex-col items-center gap-3 pt-4">
          <div className="w-2 h-2 rounded-full bg-border2" />
          <div className="w-2 h-2 rounded-full bg-border2" />
          <div className="w-2 h-2 rounded-full bg-border2" />
        </div>
        <div className="absolute left-14 right-0 top-0 h-7 border-b border-border flex items-center px-3 gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-border2" />
          <span className="w-1.5 h-1.5 rounded-full bg-border2" />
          <span className="w-1.5 h-1.5 rounded-full bg-border2" />
        </div>
        <div className="absolute left-14 right-0 top-7 bottom-0 p-5 flex flex-col gap-2.5">
          <div className="h-1.5 w-[70%] bg-border2/70 rounded-sm" />
          <div className="h-1.5 w-[55%] bg-border2/50 rounded-sm ml-4" />
          <div className="h-1.5 w-[82%] bg-border2/60 rounded-sm" />
          <div className="h-1.5 w-[38%] bg-border2/50 rounded-sm ml-4" />
          <div className="h-1.5 w-[60%] bg-border2/70 rounded-sm" />
          <div className="relative h-1.5 w-[48%] rounded-sm ml-4">
            <div className="absolute inset-0 bg-border2/50 rounded-sm" />
            <div
              className="absolute right-[-8px] top-[-2px] w-[2px] h-[10px] bg-accent"
              style={{ animation: "cursor-blink 1.1s steps(1) infinite" }}
            />
          </div>
          <div className="h-1.5 w-[72%] bg-border2/60 rounded-sm" />
        </div>
      </div>
    </div>
  );
}

// ---------- Composition ----------------------------------------------------

export function NarrativeSection() {
  return (
    <div aria-label="How Grova works">
      <BeatShell
        eyebrow="01 — the inbox"
        headline={
          <>
            <span className="tabular-nums">847</span>{" "}
            pieces of feedback{" "}
            <em className="text-text2">this week.</em>
          </>
        }
        caption="Every product ships with a waterfall of opinions — real bugs, half-baked requests, typos, praise, nonsense. Reading all of it is a tax."
        visual={<InboxNoise />}
      />

      <BeatShell
        reverse
        eyebrow="02 — the signal"
        headline={
          <>
            Grova reads all of it.{" "}
            <em className="text-text2">Ranks the 5%.</em>
          </>
        }
        caption="Every submission gets a score. Severity, signal, dedupe-awareness, tone. The noise recedes. What's left is what you'd actually do something about."
        visual={<InboxRanked />}
      />

      <BeatShell
        eyebrow="03 — ready to ship"
        headline={
          <>
            The top three land{" "}
            <em className="text-text2">in your editor.</em>
          </>
        }
        caption="Brief, scoped, prioritized — paste into Cursor or Claude Code and ship before lunch. No dashboards. No triage meetings."
        visual={<EditorWithTopThree />}
      />
    </div>
  );
}
