import { createAdminClient } from "@/lib/supabase/admin";

export async function recalculateTrustScore(userId: string): Promise<number> {
  const supabase = createAdminClient();

  const { error } = await supabase.rpc("update_trust_score", {
    target_user_id: userId,
  });

  if (error) {
    console.error("Trust score recalculation failed:", error);
    return 50;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("trust_score")
    .eq("id", userId)
    .single();

  return profile?.trust_score ?? 50;
}

export async function batchRecalculateTrustScores(): Promise<number> {
  const supabase = createAdminClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id")
    .eq("is_banned", false);

  if (!profiles) return 0;

  let updated = 0;
  for (const profile of profiles) {
    const { error } = await supabase.rpc("update_trust_score", {
      target_user_id: profile.id,
    });
    if (!error) updated++;
  }

  return updated;
}

export function getTrustEffects(score: number) {
  return {
    approvalSpeed: score >= 70 ? "fast" : score <= 30 ? "slow" : "normal",
    dailyLimitMultiplier: score >= 70 ? 1.5 : score <= 30 ? 0.5 : 1.0,
    feedPriority: score >= 70 ? "high" : score <= 30 ? "low" : "normal",
    verificationThreshold: score >= 70 ? 0.60 : score <= 30 ? 0.85 : 0.75,
  };
}
