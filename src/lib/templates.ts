export interface EmailTemplate {
  id: string;
  name: string;
  icon: string;
  subject: string;
  body: string;
  variables: string[];
  internal?: boolean;
}

export const templates: EmailTemplate[] = [
  {
    id: "recovery",
    name: "Recovery Email",
    icon: "🔄",
    subject: "We want to make this right, {{customer_name}}",
    body: "Hi {{customer_name}},\n\nThank you for taking the time to share your experience with us. We're sorry about {{issue_summary}}.\n\nWe take this seriously and want to make it right. We'd like to offer you {{offer_type}} ({{offer_value}}) on your next visit.\n\nPlease don't hesitate to reach out directly if there's anything else we can do.\n\nWarm regards,\n{{business_name}}",
    variables: [
      "customer_name",
      "business_name",
      "issue_summary",
      "offer_type",
      "offer_value",
    ],
  },
  {
    id: "thank_you_review",
    name: "Thank You + Review Nudge",
    icon: "⭐",
    subject: "Thank you for the kind words!",
    body: "Hi {{customer_name}},\n\nWe were thrilled to read your feedback — it made our day! We're glad {{positive_detail}}.\n\nIf you have a moment, we'd love it if you shared your experience on {{review_platform}}:\n{{review_url}}\n\nThank you for being a valued customer.\n\nBest,\n{{business_name}}",
    variables: [
      "customer_name",
      "business_name",
      "positive_detail",
      "review_platform",
      "review_url",
    ],
  },
  {
    id: "question_response",
    name: "Question / Info Response",
    icon: "💬",
    subject: "Re: Your question about {{topic}}",
    body: "Hi {{customer_name}},\n\nThanks for reaching out! To answer your question:\n\n{{answer}}\n\nLet us know if there's anything else we can help with.\n\nBest,\n{{business_name}}",
    variables: ["customer_name", "business_name", "topic", "answer"],
  },
  {
    id: "acknowledgment",
    name: "We Hear You",
    icon: "👋",
    subject: "We appreciate your feedback",
    body: "Hi {{customer_name}},\n\nThank you for sharing your thoughts with us. We've noted your feedback about {{issue_summary}} and our team is looking into it.\n\nWe're always working to improve, and hearing from customers like you helps us do that.\n\nBest,\n{{business_name}}",
    variables: ["customer_name", "business_name", "issue_summary"],
  },
  {
    id: "escalation_internal",
    name: "Escalation Alert",
    icon: "🚨",
    subject: "[ESCALATION] {{issue_summary}}",
    body: "INTERNAL ESCALATION\n\nFeedback ID: {{feedback_id}}\nSeverity: {{severity}}\nCategory: {{category}}\n\nCustomer message:\n\"{{customer_message}}\"\n\nRecommended action: {{recommended_action}}\n\nThis requires immediate attention.",
    variables: [
      "feedback_id",
      "severity",
      "category",
      "customer_message",
      "recommended_action",
    ],
    internal: true,
  },
  {
    id: "follow_up",
    name: "Follow-Up Check-In",
    icon: "🔔",
    subject: "Just checking in, {{customer_name}}",
    body: "Hi {{customer_name}},\n\nWe wanted to follow up on your recent experience. We took your feedback about {{issue_summary}} seriously and {{resolution_detail}}.\n\nWe hope this makes a difference. We'd love to welcome you back.\n\nWarm regards,\n{{business_name}}",
    variables: [
      "customer_name",
      "business_name",
      "issue_summary",
      "resolution_detail",
    ],
  },
  {
    id: "we_fixed_it",
    name: '"We Fixed It" Update',
    icon: "✅",
    subject: "Good news — we fixed {{issue_summary}}",
    body: "Hi {{customer_name}},\n\nWe wanted to let you know that we've addressed the issue you reported about {{issue_summary}}.\n\n{{fix_detail}}\n\nThank you for helping us improve. We hope to see you again soon.\n\nBest,\n{{business_name}}",
    variables: [
      "customer_name",
      "business_name",
      "issue_summary",
      "fix_detail",
    ],
  },
];

/** Render a template by replacing {{variable}} placeholders */
export function renderTemplate(
  templateStr: string,
  variables: Record<string, string>
): string {
  return templateStr.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || `{{${key}}}`);
}

/** Get template by ID */
export function getTemplate(id: string): EmailTemplate | undefined {
  return templates.find((t) => t.id === id);
}
