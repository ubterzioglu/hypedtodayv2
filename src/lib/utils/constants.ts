export const DEFAULT_STARTER_CREDITS = 20;
export const DEFAULT_DAILY_LIMIT = 20;
export const DEFAULT_TRUST_SCORE = 50;

export const ACTION_COSTS: Record<string, { min: number; max: number; default: number }> = {
  like: { min: 1, max: 5, default: 1 },
  comment: { min: 2, max: 10, default: 3 },
  repost: { min: 2, max: 8, default: 2 },
  follow: { min: 3, max: 10, default: 3 },
  connection_request: { min: 3, max: 10, default: 4 },
  profile_visit: { min: 1, max: 3, default: 1 },
};

export const INTEREST_TAGS = [
  "technology",
  "marketing",
  "sales",
  "startups",
  "entrepreneurship",
  "product-management",
  "design",
  "engineering",
  "data-science",
  "ai-ml",
  "finance",
  "leadership",
  "career-development",
  "remote-work",
  "productivity",
  "hr-recruiting",
  "consulting",
  "saas",
  "e-commerce",
  "sustainability",
] as const;

export const VERIFICATION_THRESHOLDS = {
  instant_approve: 0.75,
  pending: 0.50,
  reject: 0.0,
};

export const ANTI_ABUSE = {
  max_completions_per_hour: 10,
  max_completions_per_day: 20,
  rapid_fire_window_ms: 60000,
  rapid_fire_max: 5,
};
