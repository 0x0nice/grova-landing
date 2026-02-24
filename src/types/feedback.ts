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
}

export interface FeedbackItem {
  id: string;
  _id?: string;
  type: string;
  message: string;
  page?: string;
  created_at: string;
  status: "pending" | "approved" | "denied";
  email?: string;
  metadata?: Metadata;
  console_errors?: ConsoleError[];
  screenshot?: string;
  triage?: Triage;
}
