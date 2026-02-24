"use client";

import { useAuth } from "@/providers/auth-provider";
import { useProjectStore } from "@/stores/project-store";
import { EmptyState } from "@/components/ui/empty-state";

const DEV_TIERS = [
  {
    name: "Free",
    key: "free",
    price: "$0",
    period: "forever",
    features: ["1 project", "50 feedback/mo", "AI triage", "Basic scoring"],
  },
  {
    name: "Solo",
    key: "solo",
    price: "$19",
    period: "/month",
    features: [
      "3 projects",
      "500 feedback/mo",
      "AI triage + actions",
      "Cursor prompts",
      "Email alerts",
    ],
    popular: true,
  },
  {
    name: "Builder",
    key: "builder",
    price: "$49",
    period: "/month",
    features: [
      "10 projects",
      "2,000 feedback/mo",
      "Everything in Solo",
      "Priority support",
      "Custom scoring",
    ],
  },
  {
    name: "Agency",
    key: "agency",
    price: "$149",
    period: "/month",
    features: [
      "Unlimited projects",
      "10,000 feedback/mo",
      "Everything in Builder",
      "Team members",
      "API access",
      "White-label widgets",
    ],
  },
];

const BIZ_TIERS = [
  {
    name: "Free",
    key: "biz_free",
    price: "$0",
    period: "forever",
    features: ["1 location", "50 feedback/mo", "AI categorization", "Weekly digest"],
  },
  {
    name: "Essentials",
    key: "biz_essentials",
    price: "$29",
    period: "/month",
    features: [
      "1 location",
      "500 feedback/mo",
      "Suggested replies",
      "Trend analysis",
      "Email alerts",
    ],
    popular: true,
  },
  {
    name: "Growth",
    key: "biz_growth",
    price: "$79",
    period: "/month",
    features: [
      "3 locations",
      "2,000 feedback/mo",
      "Everything in Essentials",
      "Custom categories",
      "Priority support",
    ],
  },
  {
    name: "Multi",
    key: "biz_multi",
    price: "$199",
    period: "/month",
    features: [
      "Unlimited locations",
      "10,000 feedback/mo",
      "Everything in Growth",
      "Team access",
      "API access",
      "Custom integrations",
    ],
  },
];

export default function BillingPage() {
  const { isDemo } = useAuth();
  const active = useProjectStore((s) => s.active);
  const isBiz = active?.mode === "business";
  const tiers = isBiz ? BIZ_TIERS : DEV_TIERS;
  const currentPlan = "free"; // TODO: fetch from billing API

  if (!active) {
    return (
      <EmptyState
        icon="💳"
        heading="Select a project"
        description="Choose a project from the sidebar to view billing."
      />
    );
  }

  return (
    <div>
      {/* Current plan banner */}
      <div className="bg-surface border border-border rounded p-5 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <span className="block font-mono text-micro text-text3 uppercase tracking-[0.12em] mb-1">
              Current Plan
            </span>
            <span className="font-serif text-title text-text italic">
              {tiers.find((t) => t.key === currentPlan)?.name || "Free"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {currentPlan !== "free" && (
              <button
                className="font-mono text-footnote text-text3 hover:text-text2
                           px-4 py-2 rounded border border-border hover:border-border2
                           transition-colors cursor-pointer uppercase tracking-[0.04em]"
              >
                Manage Subscription
              </button>
            )}
          </div>
        </div>
        {isDemo && (
          <p className="font-mono text-micro text-orange mt-3">
            Demo mode — billing actions are disabled.
          </p>
        )}
      </div>

      {/* Plan grid */}
      <span className="block font-mono text-micro text-text3 uppercase tracking-[0.12em] mb-4">
        Available Plans
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {tiers.map((tier) => {
          const isCurrent = tier.key === currentPlan;
          return (
            <div
              key={tier.key}
              className={`
                bg-surface border rounded p-5 flex flex-col
                ${tier.popular ? (isBiz ? "border-orange" : "border-accent") : "border-border"}
                ${isCurrent ? "ring-1 ring-accent/30" : ""}
              `}
            >
              {tier.popular && (
                <span
                  className={`font-mono text-micro uppercase tracking-[0.08em] mb-2 ${
                    isBiz ? "text-orange" : "text-accent"
                  }`}
                >
                  Most Popular
                </span>
              )}
              <span className="font-mono text-footnote text-text uppercase tracking-[0.04em]">
                {tier.name}
              </span>
              <div className="mt-2 mb-4">
                <span className="font-serif text-[2rem] text-text italic leading-none">
                  {tier.price}
                </span>
                <span className="font-mono text-micro text-text3 ml-1">
                  {tier.period}
                </span>
              </div>
              <ul className="flex-1 flex flex-col gap-2 mb-5">
                {tier.features.map((f, i) => (
                  <li
                    key={i}
                    className="font-mono text-micro text-text2 leading-[1.6]"
                  >
                    <span className="text-accent mr-1.5">+</span>
                    {f}
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <span className="font-mono text-micro text-text3 uppercase tracking-[0.04em] text-center py-2">
                  Current Plan
                </span>
              ) : (
                <button
                  disabled={isDemo}
                  className={`
                    font-mono text-micro uppercase tracking-[0.04em] py-2.5 rounded
                    transition-all cursor-pointer text-center
                    ${
                      tier.popular
                        ? isBiz
                          ? "bg-orange text-white hover:opacity-90"
                          : "bg-accent text-black hover:opacity-90"
                        : "border border-border text-text2 hover:border-border2 hover:text-text"
                    }
                    disabled:opacity-30 disabled:cursor-not-allowed
                  `}
                >
                  {tier.price === "$0" ? "Downgrade" : "Upgrade"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Usage section */}
      <div className="mt-8 bg-surface border border-border rounded p-5">
        <span className="block font-mono text-micro text-text3 uppercase tracking-[0.12em] mb-4">
          This Month&apos;s Usage
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span className="block font-mono text-micro text-text3 mb-1">
              Feedback received
            </span>
            <span className="font-serif text-title text-text italic">0</span>
            <span className="font-mono text-micro text-text3"> / 50</span>
          </div>
          <div>
            <span className="block font-mono text-micro text-text3 mb-1">
              Projects
            </span>
            <span className="font-serif text-title text-text italic">1</span>
            <span className="font-mono text-micro text-text3"> / 1</span>
          </div>
          <div>
            <span className="block font-mono text-micro text-text3 mb-1">
              AI triage runs
            </span>
            <span className="font-serif text-title text-text italic">0</span>
            <span className="font-mono text-micro text-text3"> / 50</span>
          </div>
          <div>
            <span className="block font-mono text-micro text-text3 mb-1">
              Period ends
            </span>
            <span className="font-mono text-footnote text-text2">
              Mar 24, 2026
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
