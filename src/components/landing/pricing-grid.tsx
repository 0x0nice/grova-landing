"use client";

import Link from "next/link";
import { useTrack } from "@/hooks/use-track";

interface PriceTier {
  recommended?: boolean;
  tier: string;
  amount: string;
  desc: string;
  features: string[];
  cta: string;
  href: string;
}

const devTiers: PriceTier[] = [
  {
    tier: "Free",
    amount: "$0",
    desc: "Prove the loop on one product.",
    features: ["25 submissions / month", "Default triage", "AI-ready briefs", "Embeddable widget"],
    cta: "Start free",
    href: "/login?mode=signup",
  },
  {
    recommended: true,
    tier: "Solo",
    amount: "$19",
    desc: "Run a serious product with your own rules.",
    features: ["Unlimited submissions", "Project-aware triage", "Synchronized context", "No Grova badge"],
    cta: "Join Solo waitlist",
    href: "#waitlist",
  },
  {
    tier: "Builder",
    amount: "$49",
    desc: "Operate multiple products from one account.",
    features: ["Everything in Solo", "Unlimited projects", "Approval inbox", "Editor extension when released"],
    cta: "Join Builder waitlist",
    href: "#waitlist",
  },
  {
    tier: "Agency",
    amount: "$149",
    desc: "Separate client products without per-seat pricing.",
    features: ["Everything in Builder", "Unbranded widget", "Unlimited projects", "Priority support"],
    cta: "Join Agency waitlist",
    href: "#waitlist",
  },
];

const bizTiers: PriceTier[] = [
  {
    tier: "Free",
    amount: "$0",
    desc: "Start collecting across one location.",
    features: ["50 submissions / month", "Widget, QR, and direct link", "Noise filtering", "Unified inbox"],
    cta: "Start free",
    href: "/login?mode=signup",
  },
  {
    recommended: true,
    tier: "Essentials",
    amount: "$19",
    desc: "Understand the signal without reading everything.",
    features: ["Unlimited submissions", "Suggested replies", "Smart Actions", "Trend analysis"],
    cta: "Join Essentials waitlist",
    href: "#waitlist",
  },
  {
    tier: "Growth",
    amount: "$39",
    desc: "Coordinate feedback across up to three locations.",
    features: ["Everything in Essentials", "Three locations", "Custom categories", "Priority support"],
    cta: "Join Growth waitlist",
    href: "#waitlist",
  },
  {
    tier: "Multi-location",
    amount: "$99",
    desc: "Give a larger operation one feedback system.",
    features: ["Everything in Growth", "Unlimited locations", "Unbranded widget", "Priority support"],
    cta: "Join waitlist",
    href: "#waitlist",
  },
];

export function PricingGrid() {
  const { track } = useTrack();
  const tiers = track === "biz" ? bizTiers : devTiers;

  return (
    <section className="py-[72px]" aria-labelledby="pricing-title">
      <div className="mb-12 grid grid-cols-[1.25fr_0.75fr] gap-16 items-end max-md:grid-cols-1 max-md:gap-5">
        <h2 id="pricing-title" className="font-serif text-[clamp(2.5rem,6vw,5rem)] font-normal tracking-[-0.03em] leading-[0.95] text-text">
          Start free. Pay when Grova earns its place.
        </h2>
        <p className="text-[0.92rem] text-text2 leading-[1.8]">
          {track === "dev"
            ? "Per-project value without per-seat pricing. The free plan proves the workflow; Solo is the default for an active product."
            : "Free gets feedback flowing. Paid plans add judgment, replies, and multi-location operations. No annual contract required."}
        </p>
      </div>

      <div className="border-t border-border">
        {tiers.map((tier) => (
          <article
            key={tier.tier}
            className="grid grid-cols-[140px_110px_1fr_160px] gap-6 py-7 border-b border-border items-start max-lg:grid-cols-[120px_90px_1fr] max-lg:[&>*:last-child]:col-start-3 max-md:grid-cols-[1fr_auto] max-md:gap-x-4 max-md:gap-y-3 max-md:[&>*:nth-child(3)]:col-span-2 max-md:[&>*:last-child]:col-start-1 max-md:[&>*:last-child]:col-span-2"
          >
            <div>
              {tier.recommended && (
                <span className="text-[0.68rem] text-orange block mb-2">
                  Recommended
                </span>
              )}
              <h3 className="font-serif text-[1.2rem] text-text">{tier.tier}</h3>
            </div>
            <p className="font-serif text-[1.75rem] text-text tabular-nums leading-none">
              {tier.amount}<span className="font-mono text-[0.62rem] text-text3"> / mo</span>
            </p>
            <div>
              <p className="text-[0.82rem] text-text mb-2.5">{tier.desc}</p>
              <p className="text-[0.7rem] text-text3 leading-[1.7]">
                {tier.features.join(" · ")}
              </p>
            </div>
            {tier.href.startsWith("/") ? (
              <Link
                href={tier.href}
                className="text-[0.7rem] text-text underline underline-offset-4 decoration-border2 hover:decoration-orange hover:text-orange transition-colors"
              >
                {tier.cta} →
              </Link>
            ) : (
              <a
                href={tier.href}
                className="text-[0.7rem] text-text underline underline-offset-4 decoration-border2 hover:decoration-orange hover:text-orange transition-colors"
              >
                {tier.cta} →
              </a>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
