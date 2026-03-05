import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Widget Installation — Grova Docs",
  description:
    "Install the Grova feedback widget on your site with a single script tag.",
};

export default function WidgetPage() {
  return (
    <div>
      <span className="block font-mono text-caption text-text3 tracking-[0.16em] uppercase mb-4">
        Widget Installation
      </span>
      <h1 className="font-serif text-[clamp(1.75rem,3.2vw,2.4rem)] font-normal tracking-[-0.025em] leading-[1.1] text-text mb-2">
        Install the <em className="text-text2">Widget.</em>
      </h1>
      <p className="text-callout text-text3 font-light mb-10">
        Drop in a single script tag to start collecting feedback.
      </p>

      <div className="prose-grova flex flex-col gap-8">
        <section>
          <h2 className="font-mono text-footnote text-text uppercase tracking-[0.08em] mb-3">
            Developer Widget
          </h2>
          <p className="font-mono text-callout text-text2 leading-[1.7] mb-4">
            For developer projects collecting bug reports and technical
            feedback. The widget captures browser metadata, console errors, and
            optional screenshots automatically.
          </p>
          <pre className="bg-bg2 border border-border rounded p-4 overflow-x-auto font-mono text-footnote text-text2">
{`<script
  src="https://cdn.grova.dev/widget/grova-widget.js"
  data-source="your-app"
></script>`}
          </pre>
        </section>

        <section>
          <h2 className="font-mono text-footnote text-text uppercase tracking-[0.08em] mb-3">
            Business Widget
          </h2>
          <p className="font-mono text-callout text-text2 leading-[1.7] mb-4">
            For business projects collecting customer feedback with sentiment
            analysis and recovery workflows. Includes email capture for
            follow-up actions.
          </p>
          <pre className="bg-bg2 border border-border rounded p-4 overflow-x-auto font-mono text-footnote text-text2">
{`<script
  src="https://cdn.grova.dev/widget/grova-business-widget.js"
  data-source="your-business"
  data-project="YOUR_PROJECT_ID"
></script>`}
          </pre>
        </section>

        <section>
          <h2 className="font-mono text-footnote text-text uppercase tracking-[0.08em] mb-3">
            Configuration Options
          </h2>
          <p className="font-mono text-callout text-text2 leading-[1.7] mb-4">
            Customize the widget behavior with data attributes on the script
            tag.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse font-mono text-footnote">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 text-text font-medium">
                    Attribute
                  </th>
                  <th className="text-left py-2 pr-4 text-text font-medium">
                    Required
                  </th>
                  <th className="text-left py-2 text-text font-medium">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="text-text2">
                <tr className="border-b border-border">
                  <td className="py-2 pr-4">
                    <code className="text-accent">data-source</code>
                  </td>
                  <td className="py-2 pr-4">Yes</td>
                  <td className="py-2">
                    Identifier for your app or business. Used to route feedback
                    to the correct project.
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 pr-4">
                    <code className="text-accent">data-project</code>
                  </td>
                  <td className="py-2 pr-4">Business only</td>
                  <td className="py-2">
                    Your Grova project ID. Found in your project settings.
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 pr-4">
                    <code className="text-accent">data-theme</code>
                  </td>
                  <td className="py-2 pr-4">No</td>
                  <td className="py-2">
                    Widget color theme. Options: &quot;light&quot;,
                    &quot;dark&quot;, or &quot;auto&quot; (default). Auto matches
                    the user&apos;s system preference.
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 pr-4">
                    <code className="text-accent">data-position</code>
                  </td>
                  <td className="py-2 pr-4">No</td>
                  <td className="py-2">
                    Widget button position. Options:
                    &quot;bottom-right&quot; (default),
                    &quot;bottom-left&quot;, &quot;top-right&quot;,
                    &quot;top-left&quot;.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-mono text-footnote text-text uppercase tracking-[0.08em] mb-3">
            Customization Notes
          </h2>
          <ul className="font-mono text-callout text-text2 leading-[1.7] list-none p-0 flex flex-col gap-2">
            <li>
              The widget injects a floating button and modal into your page.
              It does not affect your existing styles or layout.
            </li>
            <li>
              The developer widget automatically captures console errors and
              browser metadata. No additional setup is required.
            </li>
            <li>
              For the business widget, email capture is enabled by default so
              you can send follow-up actions to customers.
            </li>
            <li>
              The widget respects Content Security Policy headers. If you use
              CSP, add cdn.grova.dev to your script-src and connect-src
              directives.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
