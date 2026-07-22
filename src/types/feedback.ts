export interface ConsoleError {
  message: string;
  source: string;
  line: number;
  col?: number;
  timestamp?: string;
}

export interface Metadata {
  browser?: string;
  os?: string;
  device_type?: string;
  viewport?: string;
  screen?: string;
  pixel_ratio?: number;
  language?: string;
  timezone?: string;
  referrer?: string;
  connection?: string;
  touch?: boolean;
  url?: string;
  surface_key?: string;
  platform?: string;
  app_version?: string;
  build_number?: string;
  commit_sha?: string;
  deployment_id?: string;
  release_channel?: string;
  session_id?: string;
  trace_id?: string;
}

export interface FeedbackContext {
  version?: number;
  surface?: Record<string, unknown>;
  release?: Record<string, unknown>;
  device?: Record<string, unknown>;
  session?: Record<string, unknown>;
  runtime?: Record<string, unknown>;
  navigation?: Record<string, unknown>;
  errors?: Record<string, unknown>;
  network?: Record<string, unknown>;
  feature_flags?: Record<string, unknown>;
  accessibility?: Record<string, unknown>;
  privacy?: Record<string, unknown>;
}

export interface SubScores {
  severity?: number;
  actionability?: number;
  specificity?: number;
  technical_clarity?: number;
  user_effort?: number;
  frequency_signal?: number;
  sentiment_intensity?: number;
  scope_estimate?: number;
  // Business-specific
  revenue_proximity?: number;
  public_visibility_risk?: number;
  customer_retention_signal?: number;
}

export interface SuggestedAction {
  type: string;
  confidence: number;
  headline: string;
  reasoning?: string;
  priority?: "high" | "medium" | "low";
  requires_customer_email?: boolean;
  template_id?: string | null;
  template_variables?: Record<string, string>;
}

export interface Triage {
  score: number;
  category?: string;
  summary?: string;
  persona_type?: string;
  signal_count?: number;
  reasoning?: string;
  recommended_action?: string;
  suggested_reply?: string;
  sub_scores?: SubScores;
  suggested_actions?: SuggestedAction[];
  acceptance_criteria?: string[];
  model_version?: string;
}

export interface FeedbackItem {
  id: string;
  _id?: string;
  type: string;
  message: string;
  page?: string;
  created_at: string;
  status: "pending" | "approved" | "denied";
  project_id?: string;
  surface_id?: string | null;
  context_version?: number;
  context?: FeedbackContext | null;
  email?: string;
  metadata?: Metadata;
  console_errors?: ConsoleError[];
  screenshot?: string;
  triage?: Triage;
}

export interface SentAction {
  id: string;
  feedback_id: string;
  project_id: string;
  action_type: string;
  template_id: string;
  template_variables: Record<string, string>;
  email_to: string | null;
  email_subject: string;
  email_body_html: string;
  status:
    | "draft"
    | "queued"
    | "sent"
    | "delivered"
    | "opened"
    | "clicked"
    | "bounced"
    | "failed";
  resend_id: string | null;
  sent_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  created_at: string;
}

export interface SendActionResponse {
  success: boolean;
  action_id: string | null;
  resend_id: string | null;
  status: string;
  warning?: string;
}

export interface ActionSettings {
  project_id?: string;
  actions_enabled: boolean;
  default_offer_type: string;
  default_offer_value: string;
  default_offer_expiry_days: number;
  max_offer_value?: string | null;
  owner_name: string | null;
  reply_to_email: string | null;
  brand_color: string;
  logo_url: string | null;
  preferred_review_platform: string;
  review_url: string | null;
  follow_up_enabled: boolean;
  follow_up_delay_days: number;
  escalation_email: string | null;
  tone: string;
  never_mention_staff_names?: boolean;
  never_auto_refund?: boolean;
}
