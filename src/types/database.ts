export type Profile = {
  id: string;
  email: string;
  full_name: string;
  linkedin_url: string | null;
  avatar_url: string | null;
  interests: string[];
  trust_score: number;
  credits: number;
  daily_limit: number;
  tasks_today: number;
  last_reset_date: string;
  is_admin: boolean;
  is_banned: boolean;
  banned_at: string | null;
  banned_reason: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
};

export type Campaign = {
  id: string;
  user_id: string;
  platform: "linkedin" | "x" | "instagram" | "youtube" | "tiktok" | "reddit";
  post_url: string;
  title: string | null;
  description: string | null;
  status: "draft" | "active" | "paused" | "completed" | "cancelled";
  targeting: Record<string, unknown>;
  schedule: Record<string, unknown>;
  pacing: "linear" | "burst" | "smart";
  visibility: "public" | "private" | "invite_only";
  total_cost: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: string;
  campaign_id: string;
  type: "like" | "comment" | "repost" | "follow" | "connection_request" | "profile_visit";
  target_count: number;
  current_count: number;
  cost_per_action: number;
  reward_per_action: number;
  constraints: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Completion = {
  id: string;
  user_id: string;
  task_id: string;
  campaign_id: string;
  status: "pending" | "approved" | "rejected" | "revoked";
  verification_score: number;
  verification_source: "heuristic" | "extension" | "manual";
  dwell_time_ms: number | null;
  click_through: boolean;
  return_latency_ms: number | null;
  extension_events: Record<string, unknown>[];
  rejection_reason: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
};

export type CreditTransaction = {
  id: string;
  user_id: string;
  amount: number;
  type: "earn" | "spend" | "adjust" | "refund";
  reason: string;
  ref_type: "completion" | "campaign" | "admin" | "system" | null;
  ref_id: string | null;
  balance_after: number;
  created_at: string;
};

export type Event = {
  id: string;
  user_id: string;
  platform: string;
  action: string;
  post_url: string;
  event_type: "extension" | "heuristic" | "manual";
  payload: Record<string, unknown>;
  nonce: string | null;
  created_at: string;
};

export type AbuseFlag = {
  id: string;
  user_id: string | null;
  type: "velocity_spike" | "multi_account" | "device_cluster" | "suspicious_pattern" | "manual";
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "investigating" | "resolved" | "dismissed";
  meta: Record<string, unknown>;
  flagged_by: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
};

export type UserAction = {
  id: string;
  user_id: string;
  action: string;
  ip_address: string | null;
  user_agent: string | null;
  device_fingerprint: string | null;
  meta: Record<string, unknown>;
  created_at: string;
};
