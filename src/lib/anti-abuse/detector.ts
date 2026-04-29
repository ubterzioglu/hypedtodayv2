import { createAdminClient } from "@/lib/supabase/admin";

export async function detectAnomalies(userId: string): Promise<string[]> {
  const anomalies: string[] = [];

  const supabase = createAdminClient();

  const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
  const { count } = await supabase
    .from("completions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", oneHourAgo);

  if ((count ?? 0) > 10) {
    anomalies.push("velocity_spike");
  }

  const { data: recentActions } = await supabase
    .from("user_actions")
    .select("ip_address, device_fingerprint")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (recentActions && recentActions.length > 0) {
    const ips = new Set(recentActions.filter((a) => a.ip_address).map((a) => a.ip_address));
    if (ips.size > 3) {
      anomalies.push("multi_account");
    }
  }

  const { data: rejections } = await supabase
    .from("completions")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "rejected")
    .gte("created_at", new Date(Date.now() - 86400000).toISOString());

  if ((rejections?.length ?? 0) > 5) {
    anomalies.push("suspicious_pattern");
  }

  return anomalies;
}

export async function flagAbuse(
  userId: string,
  type: string,
  severity: "low" | "medium" | "high" | "critical",
  meta?: Record<string, unknown>,
  flaggedBy?: string
): Promise<void> {
  const supabase = createAdminClient();
  await supabase.from("abuse_flags").insert({
    user_id: userId,
    type,
    severity,
    meta: meta || {},
    flagged_by: flaggedBy || null,
  });
}
