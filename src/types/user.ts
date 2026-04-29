import type { Profile } from "./database";

export type UserProfile = Profile;

export type UserTrustLevel = "low" | "medium" | "high";

export function getTrustLevel(score: number): UserTrustLevel {
  if (score < 30) return "low";
  if (score > 70) return "high";
  return "medium";
}

export type UserStats = {
  total_completions: number;
  approved_completions: number;
  rejected_completions: number;
  approval_rate: number;
  total_credits_earned: number;
  total_credits_spent: number;
  active_campaigns: number;
  trust_level: UserTrustLevel;
};

export type OnboardingData = {
  full_name: string;
  linkedin_url: string;
  interests: string[];
};
