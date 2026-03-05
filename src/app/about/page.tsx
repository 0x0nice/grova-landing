import type { Metadata } from "next";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — Grova",
  description:
    "Learn about Grova, the AI-powered feedback triage platform for developers and small businesses.",
};

export default function AboutPage() {
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
          About
        </span>
        <h1 className="font-serif text-[clamp(1.75rem,3.2vw,2.4rem)] font-normal tracking-[-0.025em] leading-[1.1] text-text mb-2">
          What is <em className="text-text2">Grova?</em>
        </h1>
        <p className="text-callout text-text3 font-light mb-10">
          AI-powered feedback triage for developers and small businesses.
        </p>

        <div className="prose-grova flex flex-col gap-8">
          <section>
            <h2 className="font-mono text-footnote text-text uppercase tracking-[0.08em] mb-3">
              What is Grova?
            </h2>
            <p className="font-mono text-callout text-text2 leading-[1.7]">
              Grova is an AI-powered feedback triage platform built for
              developers and small businesses. It collects feedback from your
              users, scores and categorizes it automatically, and suggests smart
              actions so you can respond faster and focus on what matters most.
              Whether you are triaging bug reports or recovering unhappy
              customers, Grova handles the noise so you can focus on building.
            </p>
          </section>

          <section>
            <h2 className="font-mono text-footnote text-text uppercase tracking-[0.08em] mb-3">
              How It Works
            </h2>
            <div className="flex flex-col gap-4">
              <div>
                <p className="font-mono text-callout text-text leading-[1.7] font-medium">
                  1. Collect
                </p>
                <p className="font-mono text-callout text-text2 leading-[1.7]">
                  Embed the Grova widget on your site or app. Users submit
                  feedback directly from your product with a single click. Bug
                  reports automatically capture metadata, console errors, and
                  screenshots.
                </p>
              </div>
              <div>
                <p className="font-mono text-callout text-text leading-[1.7] font-medium">
                  2. Triage
                </p>
                <p className="font-mono text-callout text-text2 leading-[1.7]">
                  AI analyzes every submission, scoring it on multiple
                  dimensions like severity, actionability, and sentiment. Each
                  piece of feedback gets a priority score from 1 to 10 and is
                  categorized automatically.
                </p>
              </div>
              <div>
                <p className="font-mono text-callout text-text leading-[1.7] font-medium">
                  3. Act
                </p>
                <p className="font-mono text-callout text-text2 leading-[1.7]">
                  Take action with smart suggestions. Send recovery emails with
                  discount offers, request reviews from happy customers, escalate
                  critical issues, or schedule follow-ups. One click to send, or
                  preview and edit first.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-mono text-footnote text-text uppercase tracking-[0.08em] mb-3">
              For Developers
            </h2>
            <p className="font-mono text-callout text-text2 leading-[1.7]">
              Bug reports come with rich metadata: browser info, OS, screen
              resolution, console errors, and optional screenshots. AI
              prioritizes reports by severity and actionability so you fix
              critical bugs first. Custom scoring weights let you tune the
              triage algorithm to match your workflow. Integrate via API or drop
              in the widget with a single script tag.
            </p>
          </section>

          <section>
            <h2 className="font-mono text-footnote text-text uppercase tracking-[0.08em] mb-3">
              For Businesses
            </h2>
            <p className="font-mono text-callout text-text2 leading-[1.7]">
              Collect customer feedback with a branded widget. Grova runs
              sentiment analysis on every submission, identifying unhappy
              customers before they churn. Send recovery emails with discount
              offers, schedule follow-ups, and request reviews from satisfied
              customers. AI scores feedback on revenue proximity, public
              visibility risk, and retention signals so you know exactly where
              to focus.
            </p>
          </section>

          <section>
            <h2 className="font-mono text-footnote text-text uppercase tracking-[0.08em] mb-3">
              Key Features
            </h2>
            <ul className="font-mono text-callout text-text2 leading-[1.7] list-none p-0 flex flex-col gap-2">
              <li>
                AI triage scoring with customizable weights and dimension
                breakdowns
              </li>
              <li>
                Smart actions with 7 email templates: recovery, thank you,
                question response, acknowledgment, escalation, follow-up, and
                we-fixed-it
              </li>
              <li>
                Team collaboration through organizations with role-based access
              </li>
              <li>
                Tiered plans from free to pro, with usage-based limits on
                feedback and actions
              </li>
              <li>
                Email delivery tracking with open and click analytics
              </li>
              <li>
                Follow-up scheduling with automatic 7-day reminders after
                recovery emails
              </li>
            </ul>
          </section>

          <section>
            <p className="font-mono text-callout text-text2 leading-[1.7]">
              Ready to get started?{" "}
              <Link
                href="/login?mode=signup"
                className="text-accent hover:underline"
              >
                Create your free account
              </Link>{" "}
              and start triaging feedback in minutes.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
