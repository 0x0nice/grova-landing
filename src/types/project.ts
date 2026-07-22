export interface Project {
  id: string;
  name: string;
  mode: "developer" | "business";
  source?: string;
  api_key?: string;
  plan_tier?: string;
  project_context?: string | null;
  business_config?: {
    name: string;
    type: string;
    categories: string[];
  } | null;
  scoring_weights?: Record<string, number>;
  created_at: string;
  user_id?: string;
}

export type ProjectMode = Project["mode"];
