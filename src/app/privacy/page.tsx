import type { Metadata } from "next";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Grova",
  description: "Privacy Policy for Grova, the feedback triage platform.",
};

export default function PrivacyPage() {
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
          Privacy <em className="text-text2">Policy.</em>
        </h1>
        <p className="text-callout text-text3 font-light mb-10">
          Last updated: February 24, 2026
        </p>

        <div className="flex flex-col gap-8">
          <section>
            <h2 className="font-mono text-footnote text-text uppercase tracking-[0.08em] mb-3">
              1. Information We Collect
            </h2>
            <p className="font-mono text-callout text-text2 leading-[1.7] mb-3">
              <strong className="text-text">Account data:</strong> Email
              address and authentication credentials when you create an account.
            </p>
            <p className="font-mono text-callout text-text2 leading-[1.7] mb-3">
              <strong className="text-text">Feedback data:</strong> Messages,
              metadata (browser, OS, viewport, page URL), console errors, and
              optional screenshots submitted through Grova widgets by your end
              users.
            </p>
            <p className="font-mono text-callout text-text2 leading-[1.7]">
              <strong className="text-text">Usage data:</strong> Basic analytics
              about how you interact with the dashboard (page views, feature
              usage) to improve the product.
            </p>
          </section>

          <section>
            <h2 className="font-mono text-footnote text-text uppercase tracking-[0.08em] mb-3">
              2. How We Use Your Data
            </h2>
            <p className="font-mono text-callout text-text2 leading-[1.7]">
              We use collected data to: (a) provide and maintain the Service;
              (b) process feedback through our AI triage engine; (c) send
              transactional emails (welcome, alerts, weekly digests); (d)
              improve the Service based on usage patterns. We do not sell
              personal data to third parties.
            </p>
          </section>

          <section>
            <h2 className="font-mono text-footnote text-text uppercase tracking-[0.08em] mb-3">
              3. Third-Party Services
            </h2>
            <p className="font-mono text-callout text-text2 leading-[1.7]">
              We use the following third-party services to operate Grova:
              Supabase (authentication & database), Anthropic Claude (AI triage
              processing), Stripe (payment processing), Resend (transactional
              email), Cloudflare (hosting & CDN), and Railway (API hosting).
              Each operates under their own privacy policies.
            </p>
          </section>

          <section>
            <h2 className="font-mono text-footnote text-text uppercase tracking-[0.08em] mb-3">
              4. Data Retention
            </h2>
            <p className="font-mono text-callout text-text2 leading-[1.7]">
              Account data is retained for the duration of your account. Feedback
              data is retained as long as the associated project exists. Upon
              account deletion, all data is permanently removed within 30 days.
              Billing records may be retained longer as required by law.
            </p>
          </section>

          <section>
            <h2 className="font-mono text-footnote text-text uppercase tracking-[0.08em] mb-3">
              5. Data Security
            </h2>
            <p className="font-mono text-callout text-text2 leading-[1.7]">
              We implement industry-standard security measures including
              encrypted connections (TLS), secure authentication (Supabase
              Auth), row-level security on database tables, and API key
              authentication with rotation support. However, no method of
              transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="font-mono text-footnote text-text uppercase tracking-[0.08em] mb-3">
              6. Your Rights
            </h2>
            <p className="font-mono text-callout text-text2 leading-[1.7]">
              You have the right to: (a) access your personal data; (b) request
              correction of inaccurate data; (c) request deletion of your data;
              (d) export your data in a portable format; (e) opt out of
              non-essential communications. Contact us at{" "}
              <a
                href="mailto:hello@grova.dev"
                className="text-accent hover:underline"
              >
                hello@grova.dev
              </a>{" "}
              to exercise these rights.
            </p>
          </section>

          <section>
            <h2 className="font-mono text-footnote text-text uppercase tracking-[0.08em] mb-3">
              7. Cookies
            </h2>
            <p className="font-mono text-callout text-text2 leading-[1.7]">
              We use essential cookies for authentication and theme preferences
              (localStorage). We may use analytics cookies (PostHog) to
              understand usage patterns. You can manage cookie preferences via
              the consent banner shown on your first visit.
            </p>
          </section>

          <section>
            <h2 className="font-mono text-footnote text-text uppercase tracking-[0.08em] mb-3">
              8. Changes to This Policy
            </h2>
            <p className="font-mono text-callout text-text2 leading-[1.7]">
              We may update this policy from time to time. We will notify you of
              significant changes via email or a notice on the Service. Your
              continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="font-mono text-footnote text-text uppercase tracking-[0.08em] mb-3">
              9. Contact
            </h2>
            <p className="font-mono text-callout text-text2 leading-[1.7]">
              For privacy-related questions, contact us at{" "}
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
