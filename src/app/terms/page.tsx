import type { Metadata } from "next";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — Grova",
  description: "Terms of Service for Grova, the feedback triage platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <nav className="flex items-center justify-between px-10 py-6 max-md:px-5">
        <Logo size="lg" />
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="font-mono text-footnote text-text3 hover:text-text2 transition-colors uppercase tracking-[0.04em]"
          >
            Back
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      <main className="flex-1 max-w-[720px] mx-auto px-10 max-md:px-5 py-12">
        <span className="block font-mono text-caption text-text3 tracking-[0.16em] uppercase mb-4">
          Legal
        </span>
        <h1 className="font-serif text-[clamp(1.75rem,3.2vw,2.4rem)] font-normal tracking-[-0.025em] leading-[1.1] text-text mb-2">
          Terms of <em className="text-text2">Service.</em>
        </h1>
        <p className="text-callout text-text3 font-light mb-10">
          Last updated: February 24, 2026
        </p>

        <div className="prose-grova flex flex-col gap-8">
          <section>
            <h2 className="font-mono text-footnote text-text uppercase tracking-[0.08em] mb-3">
              1. Acceptance of Terms
            </h2>
            <p className="font-mono text-callout text-text2 leading-[1.7]">
              By accessing or using Grova (&quot;Service&quot;), you agree to be bound by
              these Terms of Service. If you do not agree, do not use the
              Service. We may update these terms from time to time, and
              continued use constitutes acceptance of any changes.
            </p>
          </section>

          <section>
            <h2 className="font-mono text-footnote text-text uppercase tracking-[0.08em] mb-3">
              2. Description of Service
            </h2>
            <p className="font-mono text-callout text-text2 leading-[1.7]">
              Grova provides feedback collection, AI-powered triage, and
              management tools for software developers and small businesses. The
              Service includes web-based dashboards, embeddable widgets, APIs,
              and related functionality.
            </p>
          </section>

          <section>
            <h2 className="font-mono text-footnote text-text uppercase tracking-[0.08em] mb-3">
              3. Account Registration
            </h2>
            <p className="font-mono text-callout text-text2 leading-[1.7]">
              You must provide accurate, complete information when creating an
              account. You are responsible for maintaining the security of your
              account credentials and API keys. You must notify us immediately
              of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="font-mono text-footnote text-text uppercase tracking-[0.08em] mb-3">
              4. Acceptable Use
            </h2>
            <p className="font-mono text-callout text-text2 leading-[1.7]">
              You agree not to: (a) use the Service for any unlawful purpose;
              (b) submit spam, malicious content, or automated submissions
              designed to abuse the system; (c) attempt to gain unauthorized
              access to any part of the Service; (d) interfere with or disrupt
              the Service or servers.
            </p>
          </section>

          <section>
            <h2 className="font-mono text-footnote text-text uppercase tracking-[0.08em] mb-3">
              5. Data & Content
            </h2>
            <p className="font-mono text-callout text-text2 leading-[1.7]">
              You retain ownership of all feedback data submitted through your
              projects. Grova processes this data to provide triage scoring,
              categorization, and suggested actions. We do not sell your data to
              third parties. AI processing is performed using third-party models
              (currently Anthropic Claude) under their respective terms.
            </p>
          </section>

          <section>
            <h2 className="font-mono text-footnote text-text uppercase tracking-[0.08em] mb-3">
              6. Billing & Subscriptions
            </h2>
            <p className="font-mono text-callout text-text2 leading-[1.7]">
              Paid plans are billed monthly via Stripe. You may cancel at any
              time; cancellation takes effect at the end of the current billing
              period. Refunds are handled on a case-by-case basis. Free tier
              usage is subject to the limits described on our pricing page.
            </p>
          </section>

          <section>
            <h2 className="font-mono text-footnote text-text uppercase tracking-[0.08em] mb-3">
              7. Service Availability
            </h2>
            <p className="font-mono text-callout text-text2 leading-[1.7]">
              We strive for high availability but do not guarantee uninterrupted
              service. We may perform maintenance or updates that temporarily
              affect availability. We are not liable for any losses resulting
              from service interruptions.
            </p>
          </section>

          <section>
            <h2 className="font-mono text-footnote text-text uppercase tracking-[0.08em] mb-3">
              8. Limitation of Liability
            </h2>
            <p className="font-mono text-callout text-text2 leading-[1.7]">
              To the maximum extent permitted by law, Grova shall not be liable
              for any indirect, incidental, special, or consequential damages
              arising from your use of the Service. Our total liability shall
              not exceed the amount you have paid us in the 12 months preceding
              the claim.
            </p>
          </section>

          <section>
            <h2 className="font-mono text-footnote text-text uppercase tracking-[0.08em] mb-3">
              9. Termination
            </h2>
            <p className="font-mono text-callout text-text2 leading-[1.7]">
              We may suspend or terminate your access if you violate these
              terms. You may delete your account at any time. Upon termination,
              your data will be deleted within 30 days unless required by law to
              retain it.
            </p>
          </section>

          <section>
            <h2 className="font-mono text-footnote text-text uppercase tracking-[0.08em] mb-3">
              10. Contact
            </h2>
            <p className="font-mono text-callout text-text2 leading-[1.7]">
              Questions about these terms? Contact us at{" "}
              <a
                href="mailto:hello@grova.dev"
                className="text-accent hover:underline"
              >
                hello@grova.dev
              </a>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
