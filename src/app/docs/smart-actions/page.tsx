import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Smart Actions - Grova Docs",
  description:
    "AI-suggested email responses, templates, and follow-up workflows in Grova.",
};

export default function SmartActionsPage() {
  return (
    <div>
      <span className="block font-mono text-caption text-text3 tracking-[0.16em] uppercase mb-4">
        Smart Actions
      </span>
      <h1 className="font-serif text-[clamp(1.75rem,3.2vw,2.4rem)] font-normal tracking-[-0.02em] leading-[1.1] text-text mb-2">
        Smart <span className="text-text2">Actions.</span>
      </h1>
      <p className="text-callout text-text3 font-light mb-10">
        AI-powered email responses you can send with one click.
      </p>

      <div className="prose-grova flex flex-col gap-8">
        <section>
          <h2 className="font-mono text-footnote text-text mb-3">
            What Are Smart Actions?
          </h2>
          <p className="font-mono text-callout text-text2 leading-[1.7]">
            Smart Actions are AI-suggested email responses generated for each
            piece of feedback. When the triage pipeline scores and categorizes
            a submission, it also selects the most appropriate action template
            and drafts a personalized email. You can send it immediately with
            one click, or preview and edit the content before sending.
          </p>
        </section>

        <section>
          <h2 className="font-mono text-footnote text-text mb-3">
            Available Templates
          </h2>
          <p className="font-mono text-callout text-text2 leading-[1.7] mb-4">
            Grova includes 7 built-in email templates, each designed for a
            specific response scenario:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse font-mono text-footnote">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 text-text font-medium">
                    Template
                  </th>
                  <th className="text-left py-2 text-text font-medium">
                    Use Case
                  </th>
                </tr>
              </thead>
              <tbody className="text-text2">
                <tr className="border-b border-border">
                  <td className="py-2 pr-4">
                    <code className="text-accent">recovery</code>
                  </td>
                  <td className="py-2">
                    Win back unhappy customers with an apology and optional
                    discount offer.
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 pr-4">
                    <code className="text-accent">thank_you_review</code>
                  </td>
                  <td className="py-2">
                    Thank positive submitters and invite them to leave a public
                    review.
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 pr-4">
                    <code className="text-accent">question_response</code>
                  </td>
                  <td className="py-2">
                    Answer a question submitted through feedback.
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 pr-4">
                    <code className="text-accent">acknowledgment</code>
                  </td>
                  <td className="py-2">
                    Acknowledge receipt and let the user know their feedback
                    was heard.
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 pr-4">
                    <code className="text-accent">escalation_internal</code>
                  </td>
                  <td className="py-2">
                    Internal alert for critical issues requiring immediate team
                    attention.
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 pr-4">
                    <code className="text-accent">follow_up</code>
                  </td>
                  <td className="py-2">
                    Check in with the customer after an initial response or
                    action.
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 pr-4">
                    <code className="text-accent">we_fixed_it</code>
                  </td>
                  <td className="py-2">
                    Notify the submitter that their reported issue has been
                    resolved.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-mono text-footnote text-text mb-3">
            Send vs Preview Workflow
          </h2>
          <p className="font-mono text-callout text-text2 leading-[1.7]">
            Each feedback item in the dashboard shows a suggested action with
            a preview of the email content. You have two options: click
            &quot;Send&quot; to dispatch the email immediately as-is, or click
            &quot;Preview&quot; to open the full email editor where you can
            modify the subject, body, and template variables before sending.
            The preview mode is useful when you want to personalize the
            response or adjust the tone.
          </p>
        </section>

        <section>
          <h2 className="font-mono text-footnote text-text mb-3">
            Template Variables
          </h2>
          <p className="font-mono text-callout text-text2 leading-[1.7] mb-4">
            Templates use dynamic variables that are populated from feedback
            data and your project settings:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse font-mono text-footnote">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 text-text font-medium">
                    Variable
                  </th>
                  <th className="text-left py-2 text-text font-medium">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="text-text2">
                <tr className="border-b border-border">
                  <td className="py-2 pr-4">
                    <code className="text-accent">customer_name</code>
                  </td>
                  <td className="py-2">
                    First name of the feedback submitter. Defaults to
                    &quot;there&quot; if unavailable.
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 pr-4">
                    <code className="text-accent">owner_name</code>
                  </td>
                  <td className="py-2">
                    Your name or business name, from project settings.
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 pr-4">
                    <code className="text-accent">offer_type</code>
                  </td>
                  <td className="py-2">
                    Discount or incentive for recovery emails (e.g.,
                    &quot;15% off your next order&quot;).
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 pr-4">
                    <code className="text-accent">review_url</code>
                  </td>
                  <td className="py-2">
                    Link to your Google, Yelp, or other review platform.
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 pr-4">
                    <code className="text-accent">business_name</code>
                  </td>
                  <td className="py-2">
                    Your business name, displayed in email headers and
                    signatures.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-mono text-footnote text-text mb-3">
            Follow-Up Scheduling
          </h2>
          <p className="font-mono text-callout text-text2 leading-[1.7]">
            After sending a recovery email, Grova automatically schedules a
            follow-up check-in 7 days later. The follow-up asks the customer
            if their issue was resolved and invites them to reach out again if
            not. You can customize the follow-up delay in your project action
            settings, or disable automatic follow-ups entirely.
          </p>
        </section>

        <section>
          <h2 className="font-mono text-footnote text-text mb-3">
            Action Settings
          </h2>
          <p className="font-mono text-callout text-text2 leading-[1.7]">
            Configure default action behavior in your project settings.
            Options include default offer type for recovery emails, review
            platform URL, sender name and reply-to address, follow-up delay
            in days, and whether follow-ups are enabled. Suggested actions
            always require a person to review and send them. These settings apply to all feedback items in the
            project unless overridden at send time.
          </p>
        </section>
      </div>
    </div>
  );
}
