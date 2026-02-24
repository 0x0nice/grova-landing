import type { FeedbackItem } from "@/types/feedback";
import type { Project } from "@/types/project";

export const DEMO_PROJECTS: Project[] = [
  {
    id: "demo-dev",
    name: "Acme SaaS",
    mode: "developer",
    api_key: "demo",
    created_at: "2026-01-15T00:00:00Z",
  },
  {
    id: "demo-biz",
    name: "Corner Bistro",
    mode: "business",
    api_key: "demo",
    created_at: "2026-01-20T00:00:00Z",
  },
];

const now = Date.now();
const h = (hours: number) => new Date(now - hours * 3600000).toISOString();

export const DEMO_DEV_PENDING: FeedbackItem[] = [
  {
    id: "dd1",
    type: "bug",
    message:
      "Payment silently fails on checkout. I clicked 'Pay now' three times and nothing happened — no error, no spinner, just frozen. Had to refresh and re-enter everything. This is losing you money.",
    page: "https://acme.app/checkout",
    created_at: h(2),
    status: "pending",
    metadata: {
      browser: "Chrome 121",
      os: "Windows 11",
      device_type: "desktop",
      viewport: "1920x1080",
      screen: "1920x1080",
      language: "en-US",
      timezone: "America/New_York",
      connection: "wifi",
      url: "https://acme.app/checkout?plan=pro",
    },
    console_errors: [
      {
        message: "Uncaught TypeError: Cannot read properties of undefined (reading 'id')",
        source: "checkout.js",
        line: 342,
        col: 18,
      },
      {
        message: "POST https://api.stripe.com/v1/payment_intents 400 (Bad Request)",
        source: "network",
        line: 0,
      },
      {
        message: "Error: Payment intent creation failed — missing customer ID",
        source: "payment-service.js",
        line: 89,
        col: 5,
      },
    ],
    triage: {
      score: 9.2,
      category: "bug",
      summary: "Silent payment failure on checkout — Stripe integration broken",
      persona_type: "developer",
      signal_count: 3,
      reasoning:
        "Critical revenue-blocking bug. Payment intent fails silently due to missing customer ID. Three console errors confirm the root cause. Multiple users affected.",
      recommended_action:
        "Fix customer ID lookup in payment-service.js before creating Stripe payment intent. Add error UI so failures are visible.",
      sub_scores: {
        severity: 0.95,
        actionability: 0.9,
        specificity: 0.85,
        technical_clarity: 0.8,
        user_effort: 0.7,
        frequency_signal: 0.85,
        sentiment_intensity: 0.75,
        scope_estimate: 0.4,
      },
      suggested_actions: [
        {
          type: "escalation_alert",
          confidence: 0.95,
          headline: "Escalate: payment flow is broken",
          reasoning: "Revenue-critical issue requiring immediate fix",
          priority: "high",
          template_id: "escalation_internal",
          template_variables: {
            feedback_id: "dd1",
            severity: "Critical",
            category: "Bug",
            customer_message: "Payment silently fails on checkout.",
            recommended_action: "Fix customer ID lookup in payment-service.js",
          },
        },
      ],
    },
  },
  {
    id: "dd2",
    type: "feature",
    message:
      "Would love dark mode support. I work late and the bright white UI is genuinely painful. Even a simple toggle in settings would be great.",
    page: "https://acme.app/settings",
    created_at: h(8),
    status: "pending",
    metadata: {
      browser: "Safari 17.2",
      os: "macOS Sonoma",
      device_type: "desktop",
      viewport: "1440x900",
      screen: "2560x1600",
      language: "en-US",
      timezone: "America/Los_Angeles",
      connection: "wifi",
      url: "https://acme.app/settings",
    },
    triage: {
      score: 7.8,
      category: "feature_request",
      summary: "Dark mode feature request — common user pain point",
      persona_type: "developer",
      signal_count: 2,
      reasoning:
        "Well-articulated feature request with clear use case. Dark mode is a frequently requested accessibility feature.",
      recommended_action:
        "Implement theme toggle in settings using CSS custom properties. Start with a dark variant of the existing color palette.",
      sub_scores: {
        severity: 0.3,
        actionability: 0.75,
        specificity: 0.65,
        technical_clarity: 0.55,
        user_effort: 0.6,
        frequency_signal: 0.7,
        sentiment_intensity: 0.5,
        scope_estimate: 0.6,
      },
    },
  },
  {
    id: "dd3",
    type: "bug",
    message:
      "Search is super slow when I have more than 100 items. Takes 5+ seconds to return results. Makes the whole page feel laggy.",
    page: "https://acme.app/dashboard/search",
    created_at: h(18),
    status: "pending",
    metadata: {
      browser: "Firefox 122",
      os: "Ubuntu 22.04",
      device_type: "desktop",
      viewport: "1680x1050",
      screen: "1680x1050",
      language: "en-US",
      timezone: "America/Chicago",
      connection: "4g",
      url: "https://acme.app/dashboard/search?q=invoices",
    },
    console_errors: [
      {
        message: "Performance warning: Long task detected (5200ms)",
        source: "search-engine.js",
        line: 156,
      },
    ],
    triage: {
      score: 6.1,
      category: "bug",
      summary: "Search performance degrades with >100 items",
      persona_type: "developer",
      signal_count: 1,
      reasoning:
        "Performance issue with measurable threshold (5+ seconds). Console confirms long task. Affects core search functionality.",
      recommended_action:
        "Add debouncing to search input and implement server-side pagination or virtual scrolling for large result sets.",
      sub_scores: {
        severity: 0.6,
        actionability: 0.7,
        specificity: 0.75,
        technical_clarity: 0.65,
        user_effort: 0.5,
        frequency_signal: 0.4,
        sentiment_intensity: 0.45,
        scope_estimate: 0.55,
      },
    },
  },
  {
    id: "dd4",
    type: "ux",
    message:
      "The navigation is confusing. I keep clicking 'Projects' expecting to see my dashboard but it takes me to a marketing page. Very disorienting.",
    page: "https://acme.app/projects",
    created_at: h(36),
    status: "pending",
    metadata: {
      browser: "Chrome 121",
      os: "macOS Sonoma",
      device_type: "desktop",
      viewport: "1280x800",
      screen: "2560x1600",
      language: "en-GB",
      timezone: "Europe/London",
      connection: "wifi",
      url: "https://acme.app/projects",
    },
    triage: {
      score: 5.4,
      category: "ux",
      summary: "Navigation mismatch — 'Projects' link goes to marketing page instead of dashboard",
      persona_type: "developer",
      signal_count: 1,
      reasoning:
        "UX confusion from misleading navigation label. Clear problem description but moderate severity since workaround exists.",
      recommended_action:
        "Update the 'Projects' nav link to point to /dashboard/projects for authenticated users. Add separate 'Product' link for marketing page.",
      sub_scores: {
        severity: 0.4,
        actionability: 0.65,
        specificity: 0.7,
        technical_clarity: 0.35,
        user_effort: 0.45,
        frequency_signal: 0.35,
        sentiment_intensity: 0.55,
        scope_estimate: 0.25,
      },
    },
  },
  {
    id: "dd5",
    type: "other",
    message: "This app is kinda broken tbh. Stuff doesn't work right.",
    page: "https://acme.app",
    created_at: h(72),
    status: "pending",
    triage: {
      score: 3.1,
      category: "complaint",
      summary: "Vague complaint — no specific issue identified",
      persona_type: "developer",
      signal_count: 1,
      reasoning:
        "Very low specificity. No actionable details provided. Cannot determine what is 'broken' without follow-up.",
      sub_scores: {
        severity: 0.25,
        actionability: 0.15,
        specificity: 0.1,
        technical_clarity: 0.05,
        user_effort: 0.1,
        frequency_signal: 0.15,
        sentiment_intensity: 0.45,
        scope_estimate: 0.2,
      },
    },
  },
  {
    id: "dd6",
    type: "other",
    message: "asdf test 123 ignore this lol",
    page: "https://acme.app",
    created_at: h(96),
    status: "pending",
    triage: {
      score: 1.5,
      category: "spam",
      summary: "Test/spam submission — no real feedback",
      persona_type: "developer",
      signal_count: 1,
      reasoning: "Clearly a test submission with no meaningful content.",
      sub_scores: {
        severity: 0.05,
        actionability: 0.02,
        specificity: 0.02,
        technical_clarity: 0.01,
        user_effort: 0.02,
        frequency_signal: 0.05,
        sentiment_intensity: 0.05,
        scope_estimate: 0.95,
      },
    },
  },
];

export const DEMO_DEV_APPROVED: FeedbackItem[] = [
  {
    id: "dd7",
    type: "bug",
    message:
      "CSV export is empty when I filter by date range. The file downloads but has only headers, no data rows. Tried multiple date ranges — same result.",
    page: "https://acme.app/reports/export",
    created_at: h(48),
    status: "approved",
    metadata: {
      browser: "Chrome 121",
      os: "Windows 11",
      device_type: "desktop",
      viewport: "1920x1080",
      screen: "1920x1080",
      language: "en-US",
      timezone: "America/New_York",
      connection: "wifi",
      url: "https://acme.app/reports/export?range=2026-01-01..2026-01-31",
    },
    triage: {
      score: 7.5,
      category: "bug",
      summary: "CSV export returns only headers when date filter is applied",
      persona_type: "developer",
      signal_count: 1,
      reasoning:
        "Clear reproduction steps. Export functionality broken with date range filter. Data integrity issue.",
      recommended_action:
        "Debug the date range filter in the export query. Likely a timezone or date parsing issue causing the WHERE clause to match zero rows.",
      sub_scores: {
        severity: 0.7,
        actionability: 0.85,
        specificity: 0.8,
        technical_clarity: 0.7,
        user_effort: 0.65,
        frequency_signal: 0.35,
        sentiment_intensity: 0.4,
        scope_estimate: 0.35,
      },
    },
  },
];

export const DEMO_BIZ_PENDING: FeedbackItem[] = [
  {
    id: "db1",
    type: "other",
    message:
      "I ordered the grilled salmon but received the pasta instead. This is the second time this has happened. Very disappointed.",
    page: "https://cornerbistro.com/feedback",
    created_at: h(4),
    status: "pending",
    email: "jane@email.com",
    triage: {
      score: 8.7,
      category: "complaint",
      summary: "Wrong order delivered — repeat issue with kitchen accuracy",
      persona_type: "business",
      signal_count: 1,
      reasoning:
        "High severity repeat complaint. Customer explicitly notes this has happened before, indicating a systemic issue. High churn risk.",
      recommended_action:
        "Send recovery email with apology and offer. Flag kitchen process for review.",
      suggested_reply:
        "Hi Jane, I'm so sorry about the mix-up — especially since it's happened before. That's not the experience we want for you. I'd like to offer you a complimentary meal on your next visit. We're reviewing our kitchen process to make sure this doesn't happen again.",
      sub_scores: {
        severity: 0.9,
        actionability: 0.85,
        specificity: 0.8,
        frequency_signal: 0.7,
        sentiment_intensity: 0.75,
        user_effort: 0.6,
        revenue_proximity: 0.8,
        public_visibility_risk: 0.65,
        customer_retention_signal: 0.95,
      },
      suggested_actions: [
        {
          type: "recovery_email",
          confidence: 0.92,
          headline: "Send recovery email with complimentary meal offer",
          reasoning: "Repeat issue with high churn risk requires proactive recovery",
          priority: "high",
          requires_customer_email: true,
          template_id: "recovery",
          template_variables: {
            customer_name: "Jane",
            business_name: "Corner Bistro",
            issue_summary: "receiving the wrong order",
            offer_type: "a complimentary meal",
            offer_value: "up to $35",
          },
        },
        {
          type: "internal_flag",
          confidence: 0.88,
          headline: "Flag kitchen accuracy for review",
          reasoning: "Repeat order mix-ups suggest a process issue",
          priority: "high",
        },
        {
          type: "follow_up_reminder",
          confidence: 0.75,
          headline: "Schedule follow-up after next visit",
          reasoning: "Verify recovery worked and customer returned",
          priority: "medium",
          template_id: "follow_up",
          template_variables: {
            customer_name: "Jane",
            business_name: "Corner Bistro",
            issue_summary: "the order mix-up",
            resolution_detail: "we've implemented a double-check system in the kitchen",
          },
        },
      ],
    },
  },
  {
    id: "db2",
    type: "other",
    message:
      "Waited 25 minutes for a table even though I had a reservation. The hostess seemed overwhelmed. This happens every weekend.",
    page: "https://cornerbistro.com/feedback",
    created_at: h(12),
    status: "pending",
    email: "mike.t@gmail.com",
    triage: {
      score: 7.2,
      category: "complaint",
      summary: "Long wait despite reservation — recurring weekend staffing issue",
      persona_type: "business",
      signal_count: 1,
      reasoning:
        "Operational complaint highlighting a pattern. Customer notes this is a recurring issue, suggesting understaffing on weekends.",
      recommended_action:
        "Review weekend staffing levels. Consider additional host on busy nights.",
      suggested_reply:
        "Hi Mike, thank you for your patience and for letting us know. You're right — weekends have been busier than expected and we're working on bringing in extra staff. We value your time and want to do better.",
      sub_scores: {
        severity: 0.7,
        actionability: 0.75,
        specificity: 0.7,
        frequency_signal: 0.8,
        sentiment_intensity: 0.6,
        user_effort: 0.55,
        revenue_proximity: 0.5,
        public_visibility_risk: 0.55,
        customer_retention_signal: 0.6,
      },
      suggested_actions: [
        {
          type: "operational_change",
          confidence: 0.85,
          headline: "Increase weekend host staffing",
          reasoning: "Pattern of weekend overcrowding with reservations",
          priority: "high",
        },
        {
          type: "recovery_email",
          confidence: 0.7,
          headline: "Acknowledge the wait and offer priority seating",
          reasoning: "Customer has experienced this multiple times",
          priority: "medium",
          requires_customer_email: true,
          template_id: "recovery",
          template_variables: {
            customer_name: "Mike",
            business_name: "Corner Bistro",
            issue_summary: "the long wait time",
            offer_type: "priority seating",
            offer_value: "on your next visit",
          },
        },
      ],
    },
  },
  {
    id: "db3",
    type: "feature",
    message:
      "It would be amazing if you had a mobile ordering option. I'd love to order ahead for pickup instead of waiting in line during lunch rush.",
    page: "https://cornerbistro.com/feedback",
    created_at: h(24),
    status: "pending",
    email: "sarah.dev@outlook.com",
    triage: {
      score: 5.8,
      category: "feature_request",
      summary: "Mobile ordering / pickup feature request",
      persona_type: "business",
      signal_count: 1,
      reasoning:
        "Clear feature request with good use case. Addresses lunch rush wait times. Revenue opportunity through convenience.",
      suggested_reply:
        "Hi Sarah, great suggestion! We've been hearing more interest in mobile ordering and it's definitely on our radar. We'll keep you posted as we explore options.",
      sub_scores: {
        severity: 0.3,
        actionability: 0.55,
        specificity: 0.6,
        frequency_signal: 0.5,
        sentiment_intensity: 0.35,
        user_effort: 0.5,
        revenue_proximity: 0.65,
        public_visibility_risk: 0.15,
        customer_retention_signal: 0.4,
      },
      suggested_actions: [
        {
          type: "direct_reply",
          confidence: 0.8,
          headline: "Acknowledge request and note demand",
          reasoning: "Positive engagement opportunity",
          priority: "medium",
          requires_customer_email: true,
          template_id: "question_response",
          template_variables: {
            customer_name: "Sarah",
            business_name: "Corner Bistro",
            topic: "mobile ordering",
            answer:
              "We've been hearing more interest in mobile ordering and it's on our roadmap. We'll keep you posted!",
          },
        },
        {
          type: "operational_change",
          confidence: 0.6,
          headline: "Evaluate mobile ordering platforms",
          reasoning: "Growing demand signal for convenience features",
          priority: "low",
        },
      ],
    },
  },
  {
    id: "db4",
    type: "other",
    message:
      "Just wanted to say the new seasonal menu is incredible. The mushroom risotto was the best I've had anywhere. Only complaint — the portion could be a touch bigger!",
    page: "https://cornerbistro.com/feedback",
    created_at: h(48),
    status: "pending",
    email: "foodie_alex@yahoo.com",
    triage: {
      score: 4.0,
      category: "praise",
      summary: "Positive review of seasonal menu with minor portion feedback",
      persona_type: "business",
      signal_count: 1,
      reasoning:
        "Overwhelmingly positive feedback with minor constructive note. Great opportunity for review ask.",
      suggested_reply:
        "Hi Alex, thank you so much! We're thrilled you loved the mushroom risotto — it's our chef's favorite too. We appreciate the note about portions and we'll pass that along. Hope to see you again soon!",
      sub_scores: {
        severity: 0.1,
        actionability: 0.3,
        specificity: 0.65,
        frequency_signal: 0.2,
        sentiment_intensity: 0.7,
        user_effort: 0.55,
        revenue_proximity: 0.3,
        public_visibility_risk: 0.05,
        customer_retention_signal: 0.8,
      },
      suggested_actions: [
        {
          type: "thank_you_email",
          confidence: 0.9,
          headline: "Send thank you with review request",
          reasoning: "Happy customer — great opportunity for public review",
          priority: "medium",
          requires_customer_email: true,
          template_id: "thank_you_review",
          template_variables: {
            customer_name: "Alex",
            business_name: "Corner Bistro",
            positive_detail: "you enjoyed the seasonal menu and mushroom risotto",
            review_platform: "Google",
            review_url: "https://g.page/corner-bistro/review",
          },
        },
      ],
    },
  },
  {
    id: "db5",
    type: "other",
    message: "What are your hours on holidays? Couldn't find it on the website.",
    page: "https://cornerbistro.com/feedback",
    created_at: h(72),
    status: "pending",
    email: "questions@fastmail.com",
    triage: {
      score: 2.2,
      category: "question",
      summary: "Simple question about holiday hours",
      persona_type: "business",
      signal_count: 1,
      reasoning: "Quick factual question. Low severity but easy to address.",
      suggested_reply:
        "Hi there! Our holiday hours vary, but generally we're open 11am–8pm on most holidays. You can always check our Google Business page for the most up-to-date hours. Thanks for asking!",
      sub_scores: {
        severity: 0.05,
        actionability: 0.8,
        specificity: 0.5,
        frequency_signal: 0.3,
        sentiment_intensity: 0.1,
        user_effort: 0.25,
        revenue_proximity: 0.15,
        public_visibility_risk: 0.05,
        customer_retention_signal: 0.15,
      },
      suggested_actions: [
        {
          type: "direct_reply",
          confidence: 0.95,
          headline: "Reply with holiday hours info",
          reasoning: "Simple factual question — quick win",
          priority: "low",
          requires_customer_email: true,
          template_id: "question_response",
          template_variables: {
            customer_name: "there",
            business_name: "Corner Bistro",
            topic: "holiday hours",
            answer:
              "Our holiday hours vary, but generally we're open 11am–8pm on most holidays. You can always check our Google Business page for the most up-to-date hours.",
          },
        },
      ],
    },
  },
];

/** Demo API interceptor for GET requests */
export function demoGet(path: string): unknown {
  if (path === "/projects") return DEMO_PROJECTS;

  const feedbackMatch = path.match(/\/feedback\?project_id=([^&]+)/);
  if (feedbackMatch) {
    const pid = feedbackMatch[1];
    const statusMatch = path.match(/status=(\w+)/);
    const status = statusMatch?.[1];

    if (pid === "demo-dev") {
      if (status === "pending") return DEMO_DEV_PENDING;
      if (status === "approved") return DEMO_DEV_APPROVED;
      if (status === "denied") return [];
      return [...DEMO_DEV_PENDING, ...DEMO_DEV_APPROVED];
    }

    if (pid === "demo-biz") {
      if (status === "pending") return DEMO_BIZ_PENDING;
      if (status === "approved") return [];
      if (status === "denied") return [];
      return DEMO_BIZ_PENDING;
    }

    return [];
  }

  return [];
}

/** Demo API interceptor for POST requests */
export function demoPost(path: string): unknown {
  if (path.match(/\/feedback\/[^/]+\/(approve|deny|restore)/)) {
    return { success: true };
  }
  if (path === "/projects") {
    return {
      id: "demo-new-" + Date.now(),
      name: "New Project",
      mode: "developer",
      created_at: new Date().toISOString(),
    };
  }
  return {};
}
