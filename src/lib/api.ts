import type {
  SentAction,
  SendActionResponse,
  ActionSettings,
} from "@/types/feedback";
import type { BizConfig } from "@/stores/biz-store";

const API = process.env.NEXT_PUBLIC_API_URL!;

/** Parse error body from API response, falling back to status code. */
async function throwApiError(res: Response): Promise<never> {
  let message = `HTTP ${res.status}`;
  try {
    const body = await res.json();
    if (body.error) message = body.error;
    if (body.details) message += `: ${JSON.stringify(body.details)}`;
  } catch {
    // body wasn't JSON - use status text
    if (res.statusText) message = `${res.status} ${res.statusText}`;
  }
  throw new Error(message);
}

export async function apiGet<T>(path: string, token: string): Promise<T> {
  const res = await fetch(API + path, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) await throwApiError(res);
  return res.json();
}

export async function apiPost<T>(
  path: string,
  body: Record<string, unknown>,
  token: string
): Promise<T> {
  const res = await fetch(API + path, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) await throwApiError(res);
  return res.json();
}

export async function apiPut<T>(
  path: string,
  body: Record<string, unknown>,
  token: string
): Promise<T> {
  const res = await fetch(API + path, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) await throwApiError(res);
  return res.json();
}

// ── Actions API ──

export async function sendAction(
  body: {
    feedback_id: string;
    action_type: string;
    template_id: string;
    template_variables?: Record<string, string>;
    email_to?: string;
    subject?: string;
    body?: string;
  },
  token: string
) {
  return apiPost<SendActionResponse>("/actions/send", body as Record<string, unknown>, token);
}

export async function getActions(feedbackId: string, token: string) {
  return apiGet<SentAction[]>(`/actions?feedback_id=${feedbackId}`, token);
}

export async function sendSuggestedAction(
  feedbackId: string,
  actionIndex: number,
  token: string
) {
  return apiPost<SendActionResponse>(
    "/actions/send-suggested",
    { feedback_id: feedbackId, action_index: actionIndex },
    token
  );
}

export async function getActionSettings(projectId: string, token: string) {
  return apiGet<ActionSettings>(`/projects/${projectId}/action-settings`, token);
}

export async function putActionSettings(
  projectId: string,
  settings: Partial<ActionSettings>,
  token: string
) {
  const allowedKeys: (keyof ActionSettings)[] = [
    "actions_enabled", "default_offer_type", "default_offer_value",
    "default_offer_expiry_days", "max_offer_value", "owner_name",
    "reply_to_email", "brand_color", "logo_url", "preferred_review_platform",
    "review_url", "follow_up_enabled", "follow_up_delay_days",
    "escalation_email", "tone", "never_mention_staff_names", "never_auto_refund",
  ];
  const body: Record<string, unknown> = {};
  for (const key of allowedKeys) {
    if (settings[key] !== undefined) body[key] = settings[key];
  }
  return apiPut<ActionSettings>(
    `/projects/${projectId}/action-settings`,
    body,
    token
  );
}

export interface ProjectPreferences {
  project_context: string | null;
  business_config: BizConfig | null;
}

export function getProjectPreferences(projectId: string, token: string) {
  return apiGet<ProjectPreferences>(`/projects/${projectId}/preferences`, token);
}

export function putProjectPreferences(
  projectId: string,
  preferences: Partial<ProjectPreferences>,
  token: string
) {
  return apiPut<ProjectPreferences>(
    `/projects/${projectId}/preferences`,
    preferences as Record<string, unknown>,
    token
  );
}

export interface ScoringWeightsResponse {
  weights: Record<string, number>;
  valid_dimensions: string[];
}

export function getScoringWeights(projectId: string, token: string) {
  return apiGet<ScoringWeightsResponse>(`/projects/${projectId}/scoring-weights`, token);
}

export function putScoringWeights(projectId: string, weights: Record<string, number>, token: string) {
  return apiRequest<ScoringWeightsResponse>(
    `/projects/${projectId}/scoring-weights`,
    { method: "PATCH", body: JSON.stringify({ weights }) },
    token
  );
}

async function apiRequest<T>(path: string, init: RequestInit, token: string): Promise<T> {
  const res = await fetch(API + path, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  if (!res.ok) await throwApiError(res);
  return res.json();
}
