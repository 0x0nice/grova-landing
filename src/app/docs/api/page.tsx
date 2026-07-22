import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Reference - Grova Docs",
  description:
    "Authenticate, submit feedback, and trigger actions with the Grova API.",
};

export default function ApiReferencePage() {
  return (
    <div>
      <span className="block font-mono text-caption text-text3 tracking-[0.16em] uppercase mb-4">
        API Reference
      </span>
      <h1 className="font-serif text-[clamp(1.75rem,3.2vw,2.4rem)] font-normal tracking-[-0.02em] leading-[1.1] text-text mb-2">
        API <span className="text-text2">Reference.</span>
      </h1>
      <p className="text-callout text-text3 font-light mb-10">
        Integrate Grova into your stack with the REST API.
      </p>

      <div className="prose-grova flex flex-col gap-8">
        <section>
          <h2 className="font-mono text-footnote text-text mb-3">
            Authentication
          </h2>
          <p className="font-mono text-callout text-text2 leading-[1.7] mb-3">
            The Grova API supports two authentication methods:
          </p>
          <ul className="font-mono text-callout text-text2 leading-[1.7] list-none p-0 flex flex-col gap-2 mb-3">
            <li>
              <strong className="text-text">JWT Bearer Token</strong> -
              Pass your session token in the Authorization header:{" "}
              <code className="text-accent">
                Authorization: Bearer &lt;token&gt;
              </code>
            </li>
            <li>
              <strong className="text-text">API Key</strong> - Use a
              per-project API key via the{" "}
              <code className="text-accent">x-grova-key</code> header. Keys
              are prefixed with <code className="text-accent">gv_</code> and
              can be generated in your project settings.
            </li>
          </ul>
          <p className="font-mono text-callout text-text2 leading-[1.7]">
            API keys are scoped to a single project and can only access
            resources within that project. JWT tokens have access to all
            projects the authenticated user belongs to.
          </p>
        </section>

        <section>
          <h2 className="font-mono text-footnote text-text mb-3">
            Endpoints
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse font-mono text-footnote">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 text-text font-medium">
                    Method
                  </th>
                  <th className="text-left py-2 pr-4 text-text font-medium">
                    Path
                  </th>
                  <th className="text-left py-2 text-text font-medium">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="text-text2">
                <tr className="border-b border-border">
                  <td className="py-2 pr-4">
                    <code className="text-accent">POST</code>
                  </td>
                  <td className="py-2 pr-4">/feedback</td>
                  <td className="py-2">
                    Submit new feedback. Triggers AI triage automatically.
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 pr-4">
                    <code className="text-accent">GET</code>
                  </td>
                  <td className="py-2 pr-4">/feedback</td>
                  <td className="py-2">
                    List a paginated feedback page for one authorized project. Requires the
                    project_id query parameter for JWT or administrative keys.
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 pr-4">
                    <code className="text-accent">POST</code>
                  </td>
                  <td className="py-2 pr-4">/feedback/:id/approve</td>
                  <td className="py-2">
                    Approve a feedback item and mark it as reviewed.
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 pr-4">
                    <code className="text-accent">POST</code>
                  </td>
                  <td className="py-2 pr-4">/actions/send</td>
                  <td className="py-2">
                    Send a smart action email for a feedback item.
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 pr-4">
                    <code className="text-accent">POST</code>
                  </td>
                  <td className="py-2 pr-4">/actions/send-suggested</td>
                  <td className="py-2">
                    Send the AI-suggested action without modification.
                  </td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-2 pr-4">
                    <code className="text-accent">GET</code>
                  </td>
                  <td className="py-2 pr-4">/billing/status</td>
                  <td className="py-2">
                    Check current plan, usage, and billing status.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-mono text-footnote text-text mb-3">
            Example: Submit Feedback
          </h2>
          <p className="font-mono text-callout text-text2 leading-[1.7] mb-4">
            Send a POST request to create a new feedback item. The AI triage
            pipeline runs automatically after submission.
          </p>
          <p className="font-mono text-footnote text-text3 mb-2">Request</p>
          <pre className="bg-bg2 border border-border rounded p-4 overflow-x-auto font-mono text-footnote text-text2 mb-4">
{`POST /feedback HTTP/1.1
Host: api.grova.dev
Content-Type: application/json
x-grova-key: gv_your_project_key

{
  "message": "The checkout page crashes on Safari when I click pay.",
  "type": "bug",
  "source": "your-app",
  "email": "user@example.com",
  "metadata": {
    "browser": "Safari 17.2",
    "os": "macOS 14.3",
    "url": "/checkout"
  }
}`}
          </pre>
          <p className="font-mono text-footnote text-text3 mb-2">Response</p>
          <pre className="bg-bg2 border border-border rounded p-4 overflow-x-auto font-mono text-footnote text-text2">
{`{
  "success": true,
  "id": "fb_abc123",
  "triage_status": "queued"
}`}
          </pre>
        </section>

        <section>
          <h2 className="font-mono text-footnote text-text mb-3">
            Example: List Feedback
          </h2>
          <p className="font-mono text-callout text-text2 leading-[1.7] mb-4">
            List requests require an authorized project scope. Pages default to
            50 items and the limit is capped at 100.
          </p>
          <pre className="bg-bg2 border border-border rounded p-4 overflow-x-auto font-mono text-footnote text-text2">
{`GET /feedback?project_id=project_123&page=1&limit=50

{
  "items": [],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 0,
    "total_pages": 0,
    "has_more": false
  }
}`}
          </pre>
        </section>

        <section>
          <h2 className="font-mono text-footnote text-text mb-3">
            Rate Limiting
          </h2>
          <p className="font-mono text-callout text-text2 leading-[1.7]">
            Public feedback and transcription endpoints are rate limited to 10
            requests per minute per source IP. Standard rate limit headers are
            returned with those endpoints:{" "}
            <code className="text-accent">X-RateLimit-Limit</code>,{" "}
            <code className="text-accent">X-RateLimit-Remaining</code>, and{" "}
            <code className="text-accent">X-RateLimit-Reset</code>.
          </p>
        </section>
      </div>
    </div>
  );
}
