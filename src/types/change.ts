import type { FeedbackItem } from "@/types/feedback";

export type ChangeStatus =
  | "proposal_ready" | "approved" | "dismissed" | "dispatched"
  | "working" | "change_ready" | "verifying" | "proof_failed"
  | "ready_to_release" | "deploying" | "deployed" | "observing"
  | "closed" | "regressed" | "rolled_back";

export type AgentProvider = "codex" | "claude" | "manual";
export type RiskLevel = "low" | "medium" | "high" | "protected";

export interface VerificationCommand {
  name?: string;
  command: string;
  cwd?: string;
  kind?: string;
  required?: boolean;
  timeout_seconds?: number;
}

export interface ProjectSurface {
  id: string;
  project_id: string;
  surface_key: string;
  display_name: string;
  platform: "web" | "mobile_web" | "ios" | "ipados" | "macos" | "backend" | "other";
  repository_remote?: string | null;
  source_root?: string | null;
  build_target?: string | null;
  bundle_id?: string | null;
  verify_commands: Array<string | VerificationCommand>;
  deployment_config: {
    adapter?: "command" | "vercel" | "cloudflare" | "railway" | "xcode";
    commands?: Record<string, Array<string | { name?: string; command: string; cwd?: string; timeout_seconds?: number }>>;
    smoke_commands?: Record<string, Array<string | { name?: string; command: string; cwd?: string; timeout_seconds?: number }>>;
    rollback_commands?: Record<string, Array<string | { name?: string; command: string; cwd?: string; timeout_seconds?: number }>>;
    expected_url?: string | null;
  };
  release_channels: string[];
  context_schema: Record<string, unknown>;
  protected_paths: string[];
  risk_policy: Record<string, unknown>;
  enabled: boolean;
}

export interface ChangeProposal {
  objective: string;
  problem_statement: string;
  likely_cause?: string;
  recommended_change?: string;
  confidence?: number;
  uncertainty?: string[];
  observed_context?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface AgentRun {
  id: string;
  change_package_id: string;
  provider: AgentProvider | "other";
  dispatch_mode: "local_automated" | "interactive";
  status: "queued" | "claimed" | "running" | "awaiting_input" | "completed"
    | "failed" | "cancel_requested" | "cancelled" | "expired";
  result?: Record<string, unknown> | null;
  session_id?: string | null;
  branch_name?: string | null;
  commit_sha?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  created_at: string;
}

export interface VerificationRun {
  id: string;
  status: "queued" | "running" | "passed" | "failed" | "cancelled";
  results: Array<Record<string, unknown>>;
  artifacts: Array<Record<string, unknown>>;
  summary?: string | null;
  created_at: string;
}

export interface ReleaseCandidate {
  id: string;
  status: "draft" | "ready" | "approved" | "rejected" | "deploying" | "deployed" | "failed" | "rolled_back";
  commit_sha: string;
  branch_name?: string | null;
  risk_level: RiskLevel;
  proof_snapshot: Record<string, unknown>;
  commits?: Array<{
    commit: string;
    branch: string;
    surface_ids: string[];
    changed_files: string[];
  }>;
  created_at: string;
}

export interface Deployment {
  id: string;
  release_candidate_id: string;
  surface_id?: string | null;
  environment: "preview" | "staging" | "testflight" | "beta" | "production";
  adapter: string;
  status: "queued" | "deploying" | "cancel_requested" | "succeeded" | "failed" | "cancelled" | "rolled_back";
  url?: string | null;
  commit_sha: string;
  rollback_of?: string | null;
  last_error?: string | null;
  created_at: string;
}

export interface ReleaseApprovalResponse {
  success: boolean;
  release_candidate: ReleaseCandidate;
  change_package: ChangePackage;
  deployments: Deployment[];
}

export interface ChangeEvent {
  id: number;
  event_type: string;
  actor_type: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface ChangePackage {
  id: string;
  project_id: string;
  feedback_id: string;
  version: number;
  status: ChangeStatus;
  title: string;
  problem_statement: string;
  category?: string | null;
  observed_surface_id?: string | null;
  affected_surface_ids: string[];
  proposal: ChangeProposal;
  acceptance_criteria: string[];
  verification_plan: Array<Record<string, unknown>>;
  constraints: string[];
  prompt: string;
  prompt_sha256: string;
  model_version?: string | null;
  risk_level: RiskLevel;
  release_policy: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  feedback?: Partial<FeedbackItem> | null;
  latest_agent_run?: AgentRun | null;
}

export interface ChangeDetail extends ChangePackage {
  feedback: FeedbackItem;
  surfaces: ProjectSurface[];
  agent_runs: AgentRun[];
  verification_runs: VerificationRun[];
  release_candidates: ReleaseCandidate[];
  deployments: Deployment[];
  events: ChangeEvent[];
}

export interface ChangeApprovalResponse {
  success: boolean;
  change_package: ChangePackage;
  agent_run: AgentRun;
  handoff?: {
    provider: string;
    kind: "deep_link" | "prompt";
    url?: string;
    prompt?: string;
    sends_automatically?: boolean;
  } | null;
  idempotent?: boolean;
}

export interface RunnerDevice {
  id: string;
  name: string;
  platform: string;
  capabilities: {
    providers?: Array<"codex" | "claude">;
    [key: string]: unknown;
  };
  app_version?: string | null;
  last_seen_at?: string | null;
  revoked_at?: string | null;
  created_at: string;
}
