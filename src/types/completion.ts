import type { Completion, Task, Campaign } from "./database";

export type CompletionWithDetails = Completion & {
  task: Task;
  campaign: Campaign;
};

export type SubmitCompletionInput = {
  task_id: string;
  campaign_id: string;
  dwell_time_ms?: number;
  click_through?: boolean;
  return_latency_ms?: number;
};

export type VerificationResult = {
  score: number;
  status: Completion["status"];
  reason?: string;
};
