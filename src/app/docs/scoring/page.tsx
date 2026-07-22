import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scoring System - Grova Docs",
  description:
    "How Grova AI triage scoring works, dimension breakdowns, and custom weights.",
};

export default function ScoringPage() {
  return (
    <div>
      <span className="block font-mono text-caption text-text3 tracking-[0.16em] uppercase mb-4">
        Scoring System
      </span>
      <h1 className="font-serif text-[clamp(1.75rem,3.2vw,2.4rem)] font-normal tracking-[-0.02em] leading-[1.1] text-text mb-2">
        Triage <span className="text-text2">Scoring.</span>
      </h1>
      <p className="text-callout text-text3 font-light mb-10">
        How AI scores feedback and how to customize the weights.
      </p>

      <div className="prose-grova flex flex-col gap-8">
        <section>
          <h2 className="font-mono text-footnote text-text mb-3">
            How Scoring Works
          </h2>
          <p className="font-mono text-callout text-text2 leading-[1.7]">
            When feedback is submitted, the AI triage pipeline analyzes the
            content and assigns sub-scores across multiple dimensions. Each
            sub-score is a value from 0 to 1. The final priority score is a
            weighted average of these sub-scores, mapped to a 1&ndash;10
            scale. Higher scores indicate feedback that requires more urgent
            attention.
          </p>
        </section>

        <section>
          <h2 className="font-mono text-footnote text-text mb-3">
            Developer Dimensions
          </h2>
          <p className="font-mono text-callout text-text2 leading-[1.7] mb-4">
            Developer projects score feedback on these 8 dimensions:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse font-mono text-footnote">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 text-text font-medium">
                    Dimension
                  </th>
                  <th className="text-left py-2 text-text font-medium">
                    What It Measures
                  </th>
                </tr>
              </thead>
              <tbody className="text-text2">
                <tr className="border-b border-border">
                  <td className="py-2 pr-4">
                    <code className="text-accent">actionability</code>
                  </td>
                  <td className="py-2">
                    How clearly the feedback describes something you can act
                    on.
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 pr-4">
                    <code className="text-accent">specificity</code>
                  </td>
                  <td className="py-2">
                    Level of detail: reproduction steps, expected vs actual
                    behavior.
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 pr-4">
                    <code className="text-accent">severity</code>
                  </td>
                  <td className="py-2">
                    Impact of the issue: crash, data loss, cosmetic, etc.
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 pr-4">
                    <code className="text-accent">frequency_signal</code>
                  </td>
                  <td className="py-2">
                    Whether the feedback suggests a widely experienced
                    problem.
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 pr-4">
                    <code className="text-accent">sentiment_intensity</code>
                  </td>
                  <td className="py-2">
                    Strength of emotional tone, positive or negative.
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 pr-4">
                    <code className="text-accent">user_effort</code>
                  </td>
                  <td className="py-2">
                    How much effort the submitter invested in the report.
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 pr-4">
                    <code className="text-accent">technical_clarity</code>
                  </td>
                  <td className="py-2">
                    Quality of technical information: logs, error messages,
                    stack traces.
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 pr-4">
                    <code className="text-accent">scope_estimate</code>
                  </td>
                  <td className="py-2">
                    Estimated scope of the fix: quick patch vs architectural
                    change.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-mono text-footnote text-text mb-3">
            Business Dimensions
          </h2>
          <p className="font-mono text-callout text-text2 leading-[1.7] mb-4">
            Business projects use the same base dimensions minus
            technical_clarity and scope_estimate, and add three
            business-specific dimensions:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse font-mono text-footnote">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 text-text font-medium">
                    Dimension
                  </th>
                  <th className="text-left py-2 text-text font-medium">
                    What It Measures
                  </th>
                </tr>
              </thead>
              <tbody className="text-text2">
                <tr className="border-b border-border">
                  <td className="py-2 pr-4">
                    <code className="text-accent">revenue_proximity</code>
                  </td>
                  <td className="py-2">
                    How directly the feedback relates to revenue-impacting
                    activities.
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 pr-4">
                    <code className="text-accent">
                      public_visibility_risk
                    </code>
                  </td>
                  <td className="py-2">
                    Risk of the issue becoming a public complaint or negative
                    review.
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 pr-4">
                    <code className="text-accent">
                      customer_retention_signal
                    </code>
                  </td>
                  <td className="py-2">
                    Indicators of whether the customer is likely to churn
                    without intervention.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-mono text-footnote text-text mb-3">
            Score Anchors
          </h2>
          <p className="font-mono text-callout text-text2 leading-[1.7] mb-4">
            Use these anchors to interpret the final 1&ndash;10 priority
            score:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse font-mono text-footnote">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 text-text font-medium">
                    Score
                  </th>
                  <th className="text-left py-2 pr-4 text-text font-medium">
                    Label
                  </th>
                  <th className="text-left py-2 text-text font-medium">
                    Meaning
                  </th>
                </tr>
              </thead>
              <tbody className="text-text2">
                <tr className="border-b border-border">
                  <td className="py-2 pr-4">9 &ndash; 10</td>
                  <td className="py-2 pr-4">Drop everything</td>
                  <td className="py-2">
                    Critical issue requiring immediate action.
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 pr-4">7 &ndash; 8</td>
                  <td className="py-2 pr-4">Prioritize this week</td>
                  <td className="py-2">
                    Important feedback that should be addressed soon.
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 pr-4">5 &ndash; 6</td>
                  <td className="py-2 pr-4">Worth reading</td>
                  <td className="py-2">
                    Useful feedback to consider during planning.
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 pr-4">3 &ndash; 4</td>
                  <td className="py-2 pr-4">Background noise</td>
                  <td className="py-2">
                    Low-priority items. Review when you have time.
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 pr-4">1 &ndash; 2</td>
                  <td className="py-2 pr-4">Noise / Spam</td>
                  <td className="py-2">
                    Not actionable. Likely spam, test data, or empty
                    submissions.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-mono text-footnote text-text mb-3">
            Custom Weights
          </h2>
          <p className="font-mono text-callout text-text2 leading-[1.7] mb-4">
            You can customize the weight of each scoring dimension via the API
            to match your priorities. Weights are decimal values that
            determine how much each dimension contributes to the final score.
            Higher weights give more influence to that dimension.
          </p>
          <pre className="bg-bg2 border border-border rounded p-4 overflow-x-auto font-mono text-footnote text-text2">
{`PATCH /projects/:id/scoring-weights
Content-Type: application/json
Authorization: Bearer YOUR_SESSION_TOKEN

{
  "weights": {
    "severity": 2.0,
    "actionability": 1.5,
    "frequency_signal": 1.2,
    "specificity": 1.0,
    "sentiment_intensity": 0.8,
    "user_effort": 0.5
  }
}`}
          </pre>
          <p className="font-mono text-callout text-text2 leading-[1.7] mt-4">
            Omitted dimensions keep their default weight of 1.0. Changes
            apply to all future feedback. Existing scores are not
            recalculated automatically.
          </p>
        </section>
      </div>
    </div>
  );
}
