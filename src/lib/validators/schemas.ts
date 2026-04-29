import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  full_name: z.string().min(2).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const onboardingSchema = z.object({
  full_name: z.string().min(2).max(100),
  linkedin_url: z.string().url().refine(
    (url) => url.includes("linkedin.com/in/"),
    { message: "Must be a valid LinkedIn profile URL" }
  ).optional().or(z.literal("")),
  interests: z.array(z.string()).min(1).max(20),
});

export const createCampaignSchema = z.object({
  post_url: z.string().url().refine(
    (url) => {
      try {
        const parsed = new URL(url);
        return parsed.hostname.includes("linkedin.com");
      } catch {
        return false;
      }
    },
    { message: "Must be a valid LinkedIn post URL" }
  ),
  platform: z.enum(["linkedin", "x", "instagram", "youtube", "tiktok", "reddit"]).default("linkedin"),
  title: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  pacing: z.enum(["linear", "burst", "smart"]).default("linear"),
  visibility: z.enum(["public", "private", "invite_only"]).default("public"),
  targeting: z.record(z.string(), z.unknown()).optional(),
  tasks: z.array(z.object({
    type: z.enum(["like", "comment", "repost", "follow", "connection_request", "profile_visit"]),
    target_count: z.number().int().min(1).max(1000),
    cost_per_action: z.number().int().min(1).max(100),
    reward_per_action: z.number().int().min(1).max(100),
  })).min(1).max(10),
});

export const submitCompletionSchema = z.object({
  task_id: z.string().uuid(),
  campaign_id: z.string().uuid(),
  dwell_time_ms: z.number().int().min(0).optional(),
  click_through: z.boolean().optional(),
  return_latency_ms: z.number().int().min(0).optional(),
});

export const extensionEventSchema = z.object({
  user_id: z.string().uuid(),
  platform: z.string(),
  action: z.string(),
  post_url: z.string(),
  payload: z.record(z.string(), z.unknown()).optional(),
  nonce: z.string().optional(),
  device_fingerprint: z.string().optional(),
});

export const adminAdjustCreditsSchema = z.object({
  user_id: z.string().uuid(),
  amount: z.number().int(),
  reason: z.string().min(1),
});

export const adminBanSchema = z.object({
  user_id: z.string().uuid(),
  banned: z.boolean(),
  reason: z.string().optional(),
});

export const adminModerateSchema = z.object({
  completion_id: z.string().uuid(),
  action: z.enum(["approve", "reject"]),
  reason: z.string().optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type SubmitCompletionInput = z.infer<typeof submitCompletionSchema>;
export type ExtensionEventInput = z.infer<typeof extensionEventSchema>;
export type AdminAdjustCreditsInput = z.infer<typeof adminAdjustCreditsSchema>;
export type AdminBanInput = z.infer<typeof adminBanSchema>;
export type AdminModerateInput = z.infer<typeof adminModerateSchema>;
