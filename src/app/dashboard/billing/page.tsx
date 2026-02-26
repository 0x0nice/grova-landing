"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useProjectStore } from "@/stores/project-store";
import { EmptyState } from "@/components/ui/empty-state";
import { apiGet, apiPost } from "@/lib/api";

/* ── Tier definitions (display only — no Stripe IDs needed) ── */

interface Tier {
  name: string;
  key: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
}

const DEV_TIERS: Tier[] = [
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

const BIZ_TIERS: Tier[] = [
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
    price: "$19",
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
    price: "$39",
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
    name: "Multi-location",
    key: "biz_multi",
    price: "$99",
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

/* ── Billing status type from API ── */

interface BillingStatus {
  plan_tier: string;
  plan_status: string;
  current_period_end: string | null;
  usage: {
    feedback_count: number;
    feedback_limit: number;
  };
}

/* ── Tier ordering for upgrade/downgrade labels ── */

const TIER_ORDER: Record<string, number> = {
  free: 0,
  biz_free: 0,
  solo: 1,
  biz_essentials: 1,
  builder: 2,
  biz_growth: 2,
  agency: 3,
  biz_multi: 3,
};

/* ── Component ── */

export default function BillingPage() {
  const { session, isDemo } = useAuth();
  const active = useProjectStore((s) => s.active);
  const isBiz = active?.mode === "business";
  const tiers = isBiz ? BIZ_TIERS : DEV_TIERS;

  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const token = session?.access_token;

  // Check for success/cancelled URL params
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("success") === "true") {
        setSuccessMsg("Subscription activated! Your plan has been upgraded.");
        // Clean URL
        window.history.replaceState({}, "", window.location.pathname);
      }
      if (params.get("cancelled") === "true") {
        setError("Checkout was cancelled.");
        window.history.replaceState({}, "", window.location.pathname);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Fetch billing status
  useEffect(() => {
    if (!token || isDemo || !active) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchStatus() {
      try {
        const data = await apiGet<BillingStatus>(
          `/billing/status?projectId=${active!.id}`,
          token!
        );
        if (!cancelled) setBilling(data);
      } catch {
        // API may return 503 if Stripe not configured — fall back to free
        if (!cancelled) setBilling(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchStatus();
    return () => {
      cancelled = true;
    };
  }, [token, isDemo, active]);

  const currentPlan = billing?.plan_tier || "free";
  const currentOrder = TIER_ORDER[currentPlan] ?? 0;

  // Handle upgrade click
  const handleUpgrade = useCallback(
    async (tierKey: string) => {
      if (!token || isDemo) return;
      setActionLoading(tierKey);
      setError(null);

      try {
        const data = await apiPost<{ url: string }>(
          "/billing/checkout",
          { tier: tierKey, projectId: active?.id },
          token
        );
        if (data.url) {
          window.location.href = data.url;
        }
      } catch (err) {
        setError("Failed to start checkout. Please try again.");
        console.error("[billing] Checkout error:", err);
      } finally {
        setActionLoading(null);
      }
    },
    [token, isDemo, active]
  );

  // Handle manage subscription click
  const handleManage = useCallback(async () => {
    if (!token || isDemo) return;
    setActionLoading("manage");
    setError(null);

    try {
      const data = await apiPost<{ url: string }>(
        "/billing/portal",
        { projectId: active?.id },
        token
      );
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError("Failed to open billing portal. Please try again.");
      console.error("[billing] Portal error:", err);
    } finally {
      setActionLoading(null);
    }
  }, [token, isDemo, active]);

  if (!active) {
    return (
      <EmptyState
        icon="💳"
        heading="Select a project"
        description="Choose a project from the sidebar to view billing."
      />
    );
  }

  const feedbackCount = billing?.usage?.feedback_count ?? 0;
  const feedbackLimit = billing?.usage?.feedback_limit ?? 50;
  const periodEnd = billing?.current_period_end
    ? new Date(billing.current_period_end).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div>
      {/* Success banner */}
      {successMsg && (
        <div className="bg-accent/10 border border-accent/30 rounded p-4 mb-4">
          <p className="font-mono text-footnote text-accent">{successMsg}</p>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="bg-red/10 border border-red/30 rounded p-4 mb-4" role="alert">
          <p className="font-mono text-footnote text-red">{error}</p>
        </div>
      )}

      {/* Current plan banner */}
      <div className="bg-surface border border-border rounded p-5 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <span className="block font-mono text-footnote text-text3 uppercase tracking-[0.12em] mb-1">
              Current Plan
            </span>
            {loading ? (
              <span className="block h-7 w-24 bg-border/30 rounded animate-pulse" />
            ) : (
              <span className="font-serif text-title text-text italic">
                {tiers.find((t) => t.key === currentPlan)?.name || "Free"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {currentPlan !== "free" && currentPlan !== "biz_free" && (
              <button
                onClick={handleManage}
                disabled={isDemo || actionLoading === "manage"}
                className="font-mono text-footnote text-text3 hover:text-text2
                           px-4 py-2 rounded border border-border hover:border-border2
                           transition-colors cursor-pointer uppercase tracking-[0.04em]
                           disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {actionLoading === "manage" ? "Opening..." : "Manage Subscription"}
              </button>
            )}
          </div>
        </div>
        {billing?.plan_status === "past_due" && (
          <p className="font-mono text-footnote text-red mt-3">
            Payment past due — please update your payment method to keep your plan active.
          </p>
        )}
        {isDemo && (
          <p className="font-mono text-footnote text-orange mt-3">
            Demo mode — billing actions are disabled.
          </p>
        )}
      </div>

      {/* Plan grid */}
      <span className="block font-mono text-footnote text-text3 uppercase tracking-[0.12em] mb-4">
        Available Plans
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {tiers.map((tier) => {
          const isCurrent = tier.key === currentPlan;
          const tierOrder = TIER_ORDER[tier.key] ?? 0;
          const isUpgrade = tierOrder > currentOrder;
          const isDowngrade = tierOrder < currentOrder;
          const isFree = tier.key === "free" || tier.key === "biz_free";

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
              <span className="font-mono text-callout text-text uppercase tracking-[0.04em]">
                {tier.name}
              </span>
              <div className="mt-2 mb-4">
                <span className="font-serif text-title text-text italic leading-none">
                  {tier.price}
                </span>
                <span className="font-mono text-footnote text-text3 ml-1">
                  {tier.period}
                </span>
              </div>
              <ul className="flex-1 flex flex-col gap-2 mb-5">
                {tier.features.map((f, i) => (
                  <li
                    key={i}
                    className="font-mono text-footnote text-text2 leading-[1.6]"
                  >
                    <span className="text-accent mr-1.5">+</span>
                    {f}
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <span className="font-mono text-footnote text-text3 uppercase tracking-[0.04em] text-center py-2">
                  Current Plan
                </span>
              ) : isFree && currentOrder > 0 ? (
                <button
                  onClick={handleManage}
                  disabled={isDemo || !!actionLoading}
                  className="font-mono text-footnote uppercase tracking-[0.04em] py-2.5 rounded
                    transition-all cursor-pointer text-center
                    border border-border text-text3 hover:border-border2 hover:text-text2
                    disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Downgrade
                </button>
              ) : (
                <button
                  onClick={() => handleUpgrade(tier.key)}
                  disabled={isDemo || !!actionLoading}
                  className={`
                    font-mono text-footnote uppercase tracking-[0.04em] py-2.5 rounded
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
                  {actionLoading === tier.key
                    ? "Redirecting..."
                    : isDowngrade
                    ? "Downgrade"
                    : isUpgrade
                    ? "Upgrade"
                    : "Select"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Usage section */}
      <div className="mt-8 bg-surface border border-border rounded p-5">
        <span className="block font-mono text-footnote text-text3 uppercase tracking-[0.12em] mb-4">
          This Month&apos;s Usage
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span className="block font-mono text-footnote text-text3 mb-1">
              Feedback received
            </span>
            {loading ? (
              <span className="block h-7 w-16 bg-border/30 rounded animate-pulse" />
            ) : (
              <>
                <span className="font-serif text-title text-text italic">
                  {feedbackCount}
                </span>
                <span className="font-mono text-footnote text-text3">
                  {" "}
                  / {feedbackLimit === -1 ? "∞" : feedbackLimit}
                </span>
              </>
            )}
          </div>
          <div>
            <span className="block font-mono text-footnote text-text3 mb-1">
              Plan status
            </span>
            {loading ? (
              <span className="block h-7 w-16 bg-border/30 rounded animate-pulse" />
            ) : (
              <span
                className={`font-mono text-footnote capitalize ${
                  billing?.plan_status === "active"
                    ? "text-accent"
                    : billing?.plan_status === "past_due"
                    ? "text-red"
                    : "text-text2"
                }`}
              >
                {billing?.plan_status || "active"}
              </span>
            )}
          </div>
          <div>
            <span className="block font-mono text-footnote text-text3 mb-1">
              Current tier
            </span>
            {loading ? (
              <span className="block h-7 w-16 bg-border/30 rounded animate-pulse" />
            ) : (
              <span className="font-serif text-title text-text italic">
                {tiers.find((t) => t.key === currentPlan)?.name || "Free"}
              </span>
            )}
          </div>
          <div>
            <span className="block font-mono text-footnote text-text3 mb-1">
              Period ends
            </span>
            {loading ? (
              <span className="block h-7 w-20 bg-border/30 rounded animate-pulse" />
            ) : (
              <span className="font-mono text-footnote text-text2">
                {periodEnd || "—"}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
