import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Getting Started — Grova Docs",
  description: "Quick start guide to set up Grova and start collecting feedback.",
};

export default function GettingStartedPage() {
  return (
    <div>
      <span className="block font-mono text-caption text-text3 tracking-[0.16em] uppercase mb-4">
        Getting Started
      </span>
      <h1 className="font-serif text-[clamp(1.75rem,3.2vw,2.4rem)] font-normal tracking-[-0.025em] leading-[1.1] text-text mb-2">
        Quick <em className="text-text2">Start.</em>
      </h1>
      <p className="text-callout text-text3 font-light mb-10">
        Go from zero to triaged feedback in under five minutes.
      </p>

      <div className="prose-grova flex flex-col gap-8">
        <section>
          <h2 className="font-mono text-footnote text-text uppercase tracking-[0.08em] mb-3">
            1. Sign Up
          </h2>
          <p className="font-mono text-callout text-text2 leading-[1.7]">
            Create your free account at{" "}
            <Link href="/login?mode=signup" className="text-accent hover:underline">
              grova.dev
            </Link>
            . You can sign up with email or continue with Google. No credit card
            required for the free tier.
          </p>
        </section>

        <section>
          <h2 className="font-mono text-footnote text-text uppercase tracking-[0.08em] mb-3">
            2. Create Your First Project
          </h2>
          <p className="font-mono text-callout text-text2 leading-[1.7]">
            After signing in, create a new project from the dashboard. Choose
            Developer mode for bug reports and technical feedback, or Business
            mode for customer feedback with sentiment analysis and recovery
            workflows. Each project gets its own API key and widget
            configuration.
          </p>
        </section>

        <section>
          <h2 className="font-mono text-footnote text-text uppercase tracking-[0.08em] mb-3">
            3. Install the Widget
          </h2>
          <p className="font-mono text-callout text-text2 leading-[1.7]">
            Add the Grova widget to your site with a single script tag. The
            widget automatically captures feedback, metadata, and optional
            screenshots. See the{" "}
            <Link href="/docs/widget" className="text-accent hover:underline">
              Widget Installation guide
            </Link>{" "}
            for full setup instructions and configuration options.
          </p>
        </section>

        <section>
          <h2 className="font-mono text-footnote text-text uppercase tracking-[0.08em] mb-3">
            4. Receive Your First Feedback
          </h2>
          <p className="font-mono text-callout text-text2 leading-[1.7]">
            Once the widget is installed, users can submit feedback directly
            from your product. You can also submit test feedback from the
            dashboard or via the API to verify your setup is working correctly.
          </p>
        </section>

        <section>
          <h2 className="font-mono text-footnote text-text uppercase tracking-[0.08em] mb-3">
            5. Review Triage Results
          </h2>
          <p className="font-mono text-callout text-text2 leading-[1.7]">
            Open the Inbox in your dashboard to see feedback scored and
            categorized by AI. Each item shows a priority score from 1 to 10,
            a category label, sentiment analysis, and a breakdown of individual
            scoring dimensions. Sort and filter by score, category, or status
            to find what needs attention first.
          </p>
        </section>

        <section>
          <h2 className="font-mono text-footnote text-text uppercase tracking-[0.08em] mb-3">
            6. Send Your First Smart Action
          </h2>
          <p className="font-mono text-callout text-text2 leading-[1.7]">
            Click on any feedback item to see AI-suggested actions. Choose from
            templates like recovery emails, review requests, or
            acknowledgments. Preview the email, edit if needed, and send with
            one click. See the{" "}
            <Link
              href="/docs/smart-actions"
              className="text-accent hover:underline"
            >
              Smart Actions guide
            </Link>{" "}
            for the full list of templates and configuration options.
          </p>
        </section>
      </div>
    </div>
  );
}
