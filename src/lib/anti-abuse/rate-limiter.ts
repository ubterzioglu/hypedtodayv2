import { createAdminClient } from "@/lib/supabase/admin";
import { ANTI_ABUSE } from "@/lib/utils/constants";

export async function checkDailyLimit(userId: string): Promise<{ allowed: boolean; remaining: number }> {
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("tasks_today, daily_limit, last_reset_date")
    .eq("id", userId)
    .single();

  if (!profile) return { allowed: false, remaining: 0 };

  if (profile.last_reset_date < new Date().toISOString().split("T")[0]) {
    return { allowed: true, remaining: profile.daily_limit };
  }

  const remaining = profile.daily_limit - profile.tasks_today;
  return { allowed: remaining > 0, remaining };
}

export async function checkHourlyRate(userId: string): Promise<{ allowed: boolean; count: number }> {
  const supabase = createAdminClient();
  const oneHourAgo = new Date(Date.now() - 3600000).toISOString();

  const { count } = await supabase
    .from("completions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", oneHourAgo);

  const completionsCount = count ?? 0;
  return {
    allowed: completionsCount < ANTI_ABUSE.max_completions_per_hour,
    count: completionsCount,
  };
}

export async function checkRapidFire(userId: string): Promise<boolean> {
  const supabase = createAdminClient();
  const windowStart = new Date(Date.now() - ANTI_ABUSE.rapid_fire_window_ms).toISOString();

  const { count } = await supabase
    .from("completions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", windowStart);

  return (count ?? 0) >= ANTI_ABUSE.rapid_fire_max;
}

export async function recordUserAction(
  userId: string,
  action: string,
  meta?: {
    ipAddress?: string;
    userAgent?: string;
    deviceFingerprint?: string;
  }
): Promise<void> {
  const supabase = createAdminClient();
  await supabase.from("user_actions").insert({
    user_id: userId,
    action,
    ip_address: meta?.ipAddress || null,
    user_agent: meta?.userAgent || null,
    device_fingerprint: meta?.deviceFingerprint || null,
    meta: meta || {},
  });
}
