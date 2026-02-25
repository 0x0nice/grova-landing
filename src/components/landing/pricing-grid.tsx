"use client";

import Link from "next/link";
import { useTrack } from "@/hooks/use-track";

interface PriceTier {
  popular?: boolean;
  tier: string;
  amount: string;
  desc: string;
  features: { text: string; yes: boolean; soon?: boolean }[];
  cta: string;
  href: string;
  fill?: boolean;
}

const devTiers: PriceTier[] = [
  {
    tier: "Free",
    amount: "$0",
    desc: "Grova\u2019s default triage. Works great out of the box.",
    features: [
      { text: "25 submissions/month", yes: true },
      { text: "Full AI triage & scoring", yes: true },
      { text: "Pre-built triage rules", yes: true },
      { text: "Cursor-ready prompts", yes: true },
      { text: "Embeddable widget", yes: true },
      { text: "Custom triage rules", yes: false },
    ],
    cta: "Get started",
    href: "/login?mode=signup",
  },
  {
    popular: true,
    tier: "Solo",
    amount: "$19",
    desc: "You know your project best. Set your own rules.",
    features: [
      { text: "Unlimited submissions", yes: true },
      { text: "Full AI triage & scoring", yes: true },
      { text: "Custom triage rules", yes: true },
      { text: "Custom Cursor prompt format", yes: true },
      { text: "Approval inbox", yes: true },
      { text: "No Grova badge", yes: true },
    ],
    cta: "Join waitlist",
    href: "#waitlist",
    fill: true,
  },
  {
    tier: "Builder",
    amount: "$49",
    desc: "For developers running multiple products.",
    features: [
      { text: "Unlimited submissions", yes: true },
      { text: "Full AI triage & scoring", yes: true },
      { text: "Unlimited projects", yes: true },
      { text: "Custom triage rules", yes: true },
      { text: "Approval inbox", yes: true },
      { text: "Cursor extension", yes: true, soon: true },
    ],
    cta: "Join waitlist",
    href: "#waitlist",
  },
  {
    tier: "Agency",
    amount: "$149",
    desc: "Manage feedback for multiple clients.",
    features: [
      { text: "Everything in Builder", yes: true },
      { text: "White label widget", yes: true },
      { text: "Client management", yes: true },
      { text: "Client reporting", yes: true },
      { text: "Custom branding", yes: true },
      { text: "Priority support", yes: true },
    ],
    cta: "Join waitlist",
    href: "#waitlist",
  },
];

const bizTiers: PriceTier[] = [
  {
    tier: "Free",
    amount: "$0",
    desc: "See if Grova is right for your business. No commitment.",
    features: [
      { text: "50 submissions/month", yes: true },
      { text: "Guided contact widget", yes: true },
      { text: "Pre-set category topics", yes: true },
      { text: "Basic weekly digest", yes: true },
      { text: "AI suggested replies", yes: false },
      { text: "Custom categories", yes: false },
    ],
    cta: "Get started free",
    href: "/login?mode=signup",
  },
  {
    popular: true,
    tier: "Essentials",
    amount: "$19",
    desc: "Everything you need to understand your customers.",
    features: [
      { text: "Unlimited submissions", yes: true },
      { text: "Guided contact widget", yes: true },
      { text: "Custom categories", yes: true },
      { text: "Full plain-English digest", yes: true },
      { text: "AI suggested replies", yes: true },
      { text: "Urgent message alerts", yes: true },
    ],
    cta: "Join waitlist",
    href: "#waitlist",
    fill: true,
  },
  {
    tier: "Growth",
    amount: "$39",
    desc: "For businesses with a team or a few locations.",
    features: [
      { text: "Everything in Essentials", yes: true },
      { text: "Up to 3 locations", yes: true },
      { text: "Team dashboard access", yes: true },
      { text: "Priority message flagging", yes: true },
      { text: "Monthly trend reports", yes: true },
      { text: "White-label widget", yes: false },
    ],
    cta: "Join waitlist",
    href: "#waitlist",
  },
  {
    tier: "Multi-location",
    amount: "$99",
    desc: "For franchises and businesses across many sites.",
    features: [
      { text: "Everything in Growth", yes: true },
      { text: "Unlimited locations", yes: true },
      { text: "White-label widget", yes: true },
      { text: "Per-location reporting", yes: true },
      { text: "Custom branding", yes: true },
      { text: "Priority support", yes: true },
    ],
    cta: "Join waitlist",
    href: "#waitlist",
  },
];

function PriceCard({ tier: t, isBiz }: { tier: PriceTier; isBiz: boolean }) {
  const accentCheck = isBiz ? "text-orange" : "text-accent";
  const accentPop = isBiz ? "text-orange" : "text-accent";
  const accentLine = isBiz ? "bg-orange" : "bg-accent";
  const fillBg = isBiz ? "bg-orange text-white" : "bg-accent text-black";
  const outlineStyle = isBiz
    ? "border-orange/40 text-text2 hover:border-orange hover:text-orange"
    : "border-accent/40 text-text2 hover:border-accent hover:text-accent";

  return (
    <div
      className={`
        bg-bg p-[26px_20px] border-r border-border flex flex-col relative
        last:border-r-0
        [html[data-theme=light]_&]:bg-surface
        ${t.popular ? "bg-bg2 [html[data-theme=light]_&]:bg-bg2" : ""}
      `}
    >
      {t.popular && (
        <span className={`absolute top-0 left-0 right-0 h-[1px] ${accentLine}`} />
      )}
      {t.popular && (
        <span className={`text-[0.54rem] ${accentPop} tracking-[0.12em] uppercase block mb-2.5`}>
          Most popular
        </span>
      )}
      <span className="text-caption text-text3 tracking-[0.12em] uppercase block mb-2">
        {t.tier}
      </span>
      <div className="font-serif text-[2.2rem] text-text font-normal tracking-[-0.03em] leading-none mb-1">
        {t.amount} <span className="font-mono text-[0.66rem] text-text3 font-light">/mo</span>
      </div>
      <p className="text-[0.7rem] text-text2 leading-[1.7] my-2.5 font-light">{t.desc}</p>
      <ul className="list-none flex flex-col gap-[7px] flex-1 mb-5">
        {t.features.map((f, i) => (
          <li key={i} className={`text-[0.66rem] font-light pl-4 relative leading-[1.5] ${f.yes ? "text-text" : "text-text3"}`}>
            <span className={`absolute left-0 ${f.yes ? accentCheck : "text-border2"}`}>
              {f.yes ? "✓" : "—"}
            </span>
            {f.text}
            {f.soon && (
              <span className="text-[0.5rem] text-orange border border-orange/30 bg-orange/[0.07] px-[5px] py-[1px] rounded-pill tracking-[0.06em] uppercase ml-1 align-middle">
                soon
              </span>
            )}
          </li>
        ))}
      </ul>
      {t.href.startsWith("/") ? (
        <Link
          href={t.href}
          className={`
            block text-center p-[10px_14px] rounded font-mono text-footnote font-medium
            no-underline cursor-pointer tracking-[0.04em] transition-all duration-150
            ${t.fill
              ? `${fillBg} border-none hover:opacity-82`
              : `bg-transparent border border-solid ${outlineStyle}`
            }
          `}
        >
          {t.cta}
        </Link>
      ) : (
        <a
          href={t.href}
          className={`
            block text-center p-[10px_14px] rounded font-mono text-footnote font-medium
            no-underline cursor-pointer tracking-[0.04em] transition-all duration-150
            ${t.fill
              ? `${fillBg} border-none hover:opacity-82`
              : `bg-transparent border border-solid ${outlineStyle}`
            }
          `}
        >
          {t.cta}
        </a>
      )}
    </div>
  );
}

export function PricingGrid() {
  const { track } = useTrack();
  const tiers = track === "biz" ? bizTiers : devTiers;
  const isBiz = track === "biz";

  return (
    <section className="py-[68px]">
      <div className="grid grid-cols-2 gap-[72px] items-start mb-12 max-md:grid-cols-1 max-md:gap-6">
        <h2 className="font-serif text-[clamp(1.75rem,3.2vw,2.6rem)] font-normal tracking-[-0.025em] leading-[1.1] text-text">
          {track === "dev" ? (
            <>Start free.<br /><em className="text-text2">Scale when it clicks.</em></>
          ) : (
            <>Start free.<br /><em className="text-text2">Upgrade when it earns it.</em></>
          )}
        </h2>
        <p className="text-[0.86rem] text-text2 leading-[1.85] font-light pt-1">
          {track === "dev"
            ? "No credit card to start. Upgrade when Grova earns it. Per-project pricing — not per seat — because you\u2019re building alone."
            : "No credit card to start. Flat-rate monthly pricing — not per-message, not per-location. Grova should pay for itself in the first week."}
        </p>
      </div>
      <div className="grid grid-cols-4 border border-border rounded overflow-hidden max-lg:grid-cols-2 max-lg:[&>*:nth-child(2)]:border-r-0 max-lg:[&>*:nth-child(-n+2)]:border-b max-lg:[&>*:nth-child(-n+2)]:border-b-border max-lg:[&>*:nth-child(3)]:border-r max-lg:[&>*:nth-child(3)]:border-r-border max-md:grid-cols-1 max-md:[&>*]:border-r-0 max-md:[&>*]:border-b max-md:[&>*]:border-b-border max-md:[&>*:last-child]:border-b-0">
        {tiers.map((t, i) => (
          <PriceCard key={i} tier={t} isBiz={isBiz} />
        ))}
      </div>
    </section>
  );
}
