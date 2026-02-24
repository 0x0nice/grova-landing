export interface Project {
  id: string;
  name: string;
  mode: "developer" | "business";
  source?: string;
  api_key?: string;
  created_at: string;
  user_id?: string;
}

export type ProjectMode = Project["mode"];
