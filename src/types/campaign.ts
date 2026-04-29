import type { Campaign, Task } from "./database";

export type CampaignWithTasks = Campaign & {
  tasks: Task[];
};

export type CampaignWithStats = CampaignWithTasks & {
  total_completions: number;
  approved_completions: number;
  pending_completions: number;
  rejected_completions: number;
};

export type CreateCampaignInput = {
  post_url: string;
  platform: Campaign["platform"];
  title?: string;
  description?: string;
  pacing: Campaign["pacing"];
  visibility: Campaign["visibility"];
  targeting?: Record<string, unknown>;
  tasks: CreateTaskInput[];
};

export type CreateTaskInput = {
  type: Task["type"];
  target_count: number;
  cost_per_action: number;
  reward_per_action: number;
};
