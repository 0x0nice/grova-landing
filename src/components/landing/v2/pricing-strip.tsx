"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useTrack } from "@/hooks/use-track";

type Track = "dev" | "biz";

interface Tier {
  name: string;
  price: number;
  tagline: string;
  features: string[];
  cta: string;
  href: string;
  popular?: boolean;
}

const TIERS: Record<Track, Tier[]> = {
  dev: [
    {
      name: "Free",
      price: 0,
      tagline: "Grova's default triage. Works out of the box.",
      features: [
        "25 submissions / month",
        "Full AI triage & scoring",
        "Pre-built triage rules",
        "Cursor-ready prompts",
        "Embeddable widget",
      ],
      cta: "Start free",
      href: "/login?mode=signup",
    },
    {
      name: "Solo",
      price: 19,
      tagline: "Your project, your rules. Unlimited submissions.",
      features: [
        "Unlimited submissions",
        "Custom triage rules",
        "Custom Cursor prompt format",
        "Approval inbox",
        "No Grova badge",
      ],
      cta: "Join waitlist",
      href: "#waitlist",
      popular: true,
    },
    {
      name: "Builder",
      price: 49,
      tagline: "Running multiple products. One brain behind them.",
      features: [
        "Everything in Solo",
        "Unlimited projects",
        "Cross-project analytics",
        "Custom triage rules",
        "Priority support",
      ],
      cta: "Join waitlist",
      href: "#waitlist",
    },
    {
      name: "Agency",
      price: 149,
      tagline: "Feedback infrastructure for your clients.",
      features: [
        "Everything in Builder",
        "White-label widget",
        "Client management",
        "Client reporting",
        "Custom branding",
      ],
      cta: "Join waitlist",
      href: "#waitlist",
    },
  ],
  biz: [
    {
      name: "Free",
      price: 0,
      tagline: "Start collecting feedback today.",
      features: [
        "50 submissions / month",
        "Widget, QR & direct link",
        "AI spam filtering",
        "Unified feedback inbox",
        "Embeddable widget",
      ],
      cta: "Start free",
      href: "/login?mode=signup",
    },
    {
      name: "Growth",
      price: 19,
      tagline: "Stop reading everything. Let Grova tell you what matters.",
      features: [
        "Unlimited submissions",
        "Weekly intelligence brief",
        "Pattern detection & alerts",
        "Smart Actions",
        "No Grova badge",
      ],
      cta: "Join waitlist",
      href: "#waitlist",
      popular: true,
    },
    {
      name: "Pro",
      price: 49,
      tagline: "Multiple locations. High volume. Daily briefs.",
      features: [
        "Everything in Growth",
        "Unlimited locations",
        "Daily briefs",
        "Exportable reports",
        "Team access (up to 3)",
      ],
      cta: "Join waitlist",
      href: "#waitlist",
    },
    {
      name: "Agency",
      price: 149,
      tagline: "Manage feedback across every client you have.",
      features: [
        "Everything in Pro",
        "White-label widget",
        "Client management",
        "Client reporting",
        "Custom branding",
      ],
      cta: "Join waitlist",
      href: "#waitlist",
    },
  ],
};

export function PricingStrip() {
  const { track, setTrack } = useTrack();
  const tiers = TIERS[track];
  const defaultIndex = tiers.findIndex((t) => t.popular);
  const [index, setIndex] = useState(defaultIndex >= 0 ? defaultIndex : 1);
  const active = tiers[index];

  return (
    <section
      id="pricing"
      className="relative py-32 max-md:py-20 px-8 max-md:px-5"
      aria-label="Pricing"
    >
      <div className="mx-auto max-w-[960px]">
        {/* Section label */}
        <div className="flex items-center justify-between gap-6 mb-14 max-md:flex-col max-md:items-start max-md:gap-8">
          <div>
            <span className="block font-mono text-caption text-text3 uppercase mb-3">
              Pricing
            </span>
            <h2
              className="font-serif font-normal leading-[1.05] text-text [text-wrap:balance]"
              style={{
                fontSize: "clamp(2rem, 5vw, 3.25rem)",
                letterSpacing: "-0.02em",
              }}
            >
              Start free. <em className="text-text2">Upgrade when it clicks.</em>
            </h2>
          </div>

          {/* Segmented track control */}
          <div
            role="tablist"
            aria-label="Select track"
            className="inline-flex items-center p-1 rounded-pill border border-border bg-bg2 shrink-0"
          >
            {(["dev", "biz"] as Track[]).map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={track === t}
                onClick={() => setTrack(t)}
                className={`relative font-mono text-[0.7rem] uppercase tracking-[0.12em] px-4 py-2 rounded-pill transition-colors duration-[180ms] ${
                  track === t
                    ? "text-text"
                    : "text-text3 hover:text-text2"
                }`}
              >
                {track === t && (
                  <motion.span
                    layoutId="track-pill"
                    className="absolute inset-0 bg-surface border border-border rounded-pill"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative">
                  {t === "dev" ? "For devs" : "For teams"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Tier tab row */}
        <div
          role="tablist"
          aria-label="Select a tier"
          className="flex items-center gap-8 max-md:gap-5 border-b border-border mb-10 overflow-x-auto scrollbar-none"
        >
          {tiers.map((t, i) => {
            const selected = i === index;
            return (
              <button
                key={t.name}
                role="tab"
                aria-selected={selected}
                onClick={() => setIndex(i)}
                className={`relative shrink-0 pb-4 font-mono text-footnote uppercase transition-colors duration-[180ms] cursor-pointer ${
                  selected
                    ? "text-text"
                    : "text-text3 hover:text-text2"
                }`}
              >
                {t.name}
                {selected && (
                  <motion.span
                    layoutId="tier-underline"
                    className="absolute left-0 right-0 -bottom-px h-px bg-accent"
                    transition={{ type: "spring", stiffness: 400, damping: 36 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Active tier — animated */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${track}-${active.name}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.32, ease: "easeOut" }}
            className="grid grid-cols-[1fr_auto] gap-16 items-start max-md:grid-cols-1 max-md:gap-10"
          >
            {/* Left: tagline + features */}
            <div>
              <p
                className="font-serif font-normal text-text [text-wrap:balance]"
                style={{
                  fontSize: "clamp(1.25rem, 2.4vw, 1.75rem)",
                  lineHeight: 1.25,
                  letterSpacing: "-0.01em",
                }}
              >
                {active.tagline}
              </p>
              <ul className="mt-8 flex flex-col gap-3.5">
                {active.features.map((f) => (
                  <li
                    key={f}
                    className="font-mono text-callout text-text2 flex items-start gap-3"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-[0.55em] w-[5px] h-[5px] rounded-full bg-text3 shrink-0"
                    />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: price + CTA */}
            <div className="text-right max-md:text-left">
              <div className="flex items-baseline gap-2 justify-end max-md:justify-start">
                <span
                  className="font-serif font-normal text-text tabular-nums"
                  style={{
                    fontSize: "clamp(3.5rem, 7vw, 6rem)",
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                  }}
                >
                  ${active.price}
                </span>
                <span className="font-mono text-callout text-text3 font-light">
                  / mo
                </span>
              </div>
              {active.price === 0 ? (
                <p className="mt-2 font-mono text-footnote text-text3">
                  no credit card required
                </p>
              ) : (
                <p className="mt-2 font-mono text-footnote text-text3">
                  per project · billed monthly
                </p>
              )}
              {active.href.startsWith("/") ? (
                <Link
                  href={active.href}
                  className="mt-8 inline-flex items-center justify-center gap-2 bg-accent text-black rounded px-6 py-3
                             font-mono font-medium text-footnote uppercase
                             [html[data-theme=dark]_&]:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]
                             transition-all duration-[180ms]
                             hover:opacity-92 hover:-translate-y-px hover:shadow-sm
                             active:scale-[0.98] active:translate-y-0"
                >
                  {active.cta} <span className="inline-block -translate-y-px">→</span>
                </Link>
              ) : (
                <a
                  href={active.href}
                  className="mt-8 inline-flex items-center justify-center gap-2 bg-accent text-black rounded px-6 py-3
                             font-mono font-medium text-footnote uppercase
                             [html[data-theme=dark]_&]:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]
                             transition-all duration-[180ms]
                             hover:opacity-92 hover:-translate-y-px hover:shadow-sm
                             active:scale-[0.98] active:translate-y-0"
                >
                  {active.cta} <span className="inline-block -translate-y-px">→</span>
                </a>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
