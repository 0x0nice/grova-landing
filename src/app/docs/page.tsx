import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Documentation — Grova",
  description:
    "Guides, API reference, and resources for building with Grova.",
};

const cards = [
  {
    href: "/docs/getting-started",
    icon: "\u{1F680}",
    title: "Getting Started",
    description: "Set up your first project and start collecting feedback.",
  },
  {
    href: "/docs/widget",
    icon: "\u{1F9E9}",
    title: "Widget Installation",
    description: "Embed the feedback widget on your site or app.",
  },
  {
    href: "/docs/api",
    icon: "\u{1F4BB}",
    title: "API Reference",
    description: "Authenticate, submit feedback, and trigger actions via API.",
  },
  {
    href: "/docs/smart-actions",
    icon: "\u{26A1}",
    title: "Smart Actions",
    description: "AI-suggested email responses and follow-up workflows.",
  },
  {
    href: "/docs/scoring",
    icon: "\u{1F4CA}",
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
        Grova <em className="text-text2">Docs.</em>
      </h1>
      <p className="text-callout text-text3 font-light mb-10">
        Everything you need to integrate and use Grova.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group block border border-border rounded-lg p-5 no-underline transition-colors duration-[180ms] hover:border-border2"
          >
            <span className="text-[1.4rem] mb-2 block">{card.icon}</span>
            <span className="block font-mono text-footnote text-text font-medium mb-1">
              {card.title}
            </span>
            <span className="block font-mono text-caption text-text3 leading-[1.5]">
              {card.description}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
