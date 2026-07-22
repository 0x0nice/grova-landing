import type {
  SentAction,
  SendActionResponse,
  ActionSettings,
} from "@/types/feedback";
import type { BizConfig } from "@/stores/biz-store";
import type {
  AgentProvider,
  ChangeApprovalResponse,
  ChangeDetail,
  ChangePackage,
  ReleaseApprovalResponse,
  ProjectSurface,
  RunnerDevice,
} from "@/types/change";
import type { PageResponse } from "@/types/pagination";

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

export function getChanges(projectId: string, token: string, page = 1) {
  return apiGet<PageResponse<ChangePackage>>(
    `/changes?project_id=${encodeURIComponent(projectId)}&page=${page}&limit=50`,
    token
  );
}

export function getChange(changeId: string, token: string) {
  return apiGet<ChangeDetail>(`/changes/${changeId}`, token);
}

export function approveChange(
  changeId: string,
  provider: AgentProvider,
  dispatchMode: "local_automated" | "interactive",
  token: string
) {
  return apiPost<ChangeApprovalResponse>(
    `/changes/${changeId}/approve`,
    { provider, dispatch_mode: dispatchMode },
    token
  );
}

export function dismissChange(changeId: string, rationale: string | null, token: string) {
  return apiPost<{ success: boolean; change_package: ChangePackage }>(
    `/changes/${changeId}/dismiss`,
    { rationale },
    token
  );
}

export function cancelChangeRun(changeId: string, token: string) {
  return apiPost<{ success: boolean }>(`/changes/${changeId}/cancel`, {}, token);
}

export function approveRelease(
  releaseId: string,
  targets: Array<{ surface_id: string; environment: string }>,
  token: string
) {
  return apiPost<ReleaseApprovalResponse>(
    `/releases/${releaseId}/approve`,
    { targets },
    token
  );
}

export function requestRollback(
  releaseId: string,
  deploymentId: string,
  rationale: string,
  token: string
) {
  return apiPost<{ success: boolean; deployment: import("@/types/change").Deployment }>(
    `/releases/${releaseId}/rollback`,
    { deployment_id: deploymentId, rationale },
    token
  );
}

export function retryRelease(releaseId: string, rationale: string | null, token: string) {
  return apiPost<ReleaseApprovalResponse>(
    `/releases/${releaseId}/retry`,
    { rationale },
    token
  );
}

export function getProjectSurfaces(projectId: string, token: string) {
  return apiGet<ProjectSurface[]>(`/projects/${projectId}/surfaces`, token);
}

export function createProjectSurface(
  projectId: string,
  surface: Omit<ProjectSurface, "id" | "project_id" | "enabled"> & { enabled?: boolean },
  token: string
) {
  return apiPost<ProjectSurface>(
    `/projects/${projectId}/surfaces`,
    surface as unknown as Record<string, unknown>,
    token
  );
}

export function updateProjectSurface(
  projectId: string,
  surfaceId: string,
  updates: Partial<ProjectSurface>,
  token: string
) {
  return apiRequest<ProjectSurface>(
    `/projects/${projectId}/surfaces/${surfaceId}`,
    { method: "PATCH", body: JSON.stringify(updates) },
    token
  );
}

export function createRunnerPairingCode(token: string) {
  return apiPost<{ code: string; expires_at: string }>("/runner/pairing-codes", {}, token);
}

export function getRunnerDevices(token: string) {
  return apiGet<RunnerDevice[]>("/runner/devices", token);
}

export function revokeRunnerDevice(deviceId: string, token: string) {
  return apiRequest<{ success: boolean }>(
    `/runner/devices/${deviceId}`,
    { method: "DELETE" },
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
