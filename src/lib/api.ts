import type {
  SentAction,
  SendActionResponse,
  ActionSettings,
} from "@/types/feedback";

const API = process.env.NEXT_PUBLIC_API_URL!;

/** Parse error body from API response, falling back to status code. */
async function throwApiError(res: Response): Promise<never> {
  let message = `HTTP ${res.status}`;
  try {
    const body = await res.json();
    if (body.error) message = body.error;
    if (body.details) message += `: ${JSON.stringify(body.details)}`;
  } catch {
    // body wasn't JSON — use status text
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

export async function getActionSettings(projectId: string, token: string) {
  return apiGet<ActionSettings>(`/projects/${projectId}/action-settings`, token);
}

export async function putActionSettings(
  projectId: string,
  settings: Partial<ActionSettings>,
  token: string
) {
  return apiPut<ActionSettings>(
    `/projects/${projectId}/action-settings`,
    settings as Record<string, unknown>,
    token
  );
}
