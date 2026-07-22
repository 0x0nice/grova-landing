import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Documentation - Grova",
  description:
    "Guides, API reference, and resources for building with Grova.",
};

const cards = [
  {
    href: "/docs/getting-started",
    code: "01",
    title: "Getting Started",
    description: "Set up your first project and start collecting feedback.",
  },
  {
    href: "/docs/widget",
    code: "02",
    title: "Widget Installation",
    description: "Embed the feedback widget on your site or app.",
  },
  {
    href: "/docs/api",
    code: "03",
    title: "API Reference",
    description: "Authenticate, submit feedback, and trigger actions via API.",
  },
  {
    href: "/docs/smart-actions",
    code: "04",
    title: "Smart Actions",
    description: "AI-suggested email responses and follow-up workflows.",
  },
  {
    href: "/docs/scoring",
    code: "05",
    title: "Scoring System",
    description: "How AI triage scoring works and how to customize weights.",
  },
];

export default function DocsPage() {
  return (
    <div>
      <span className="block font-mono text-caption text-text3 tracking-[0.16em] uppercase mb-4">
        Documentation
      </span>
      <h1 className="font-serif text-[clamp(1.75rem,3.2vw,2.4rem)] font-normal tracking-[-0.02em] leading-[1.1] text-text mb-2">
        Grova <span className="text-text2">Docs.</span>
      </h1>
      <p className="text-callout text-text3 font-light mb-10">
        Everything you need to integrate and use Grova.
      </p>

      <div className="border-t border-border">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group grid grid-cols-[54px_180px_1fr_auto] gap-5 items-baseline py-5 border-b border-border no-underline transition-colors duration-[180ms] hover:border-text3 max-md:grid-cols-[42px_1fr_auto]"
          >
            <span className="font-mono text-caption text-text3">{card.code}</span>
            <span className="block font-serif text-[1.05rem] text-text max-md:col-span-1">
              {card.title}
            </span>
            <span className="block font-mono text-caption text-text3 leading-[1.5] max-md:col-start-2 max-md:col-span-2">
              {card.description}
            </span>
            <span className="text-text3 group-hover:text-text transition-colors" aria-hidden="true">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
