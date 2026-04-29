import { createAdminClient } from "@/lib/supabase/admin";
import type { VerificationSignals } from "./engine";

export async function collectSignals(
  userId: string,
  dwellTimeMs?: number,
  clickThrough?: boolean,
  returnLatencyMs?: number
): Promise<VerificationSignals> {
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("trust_score")
    .eq("id", userId)
    .single();

  const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
  const { count } = await supabase
    .from("completions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", oneHourAgo);

  return {
    clickThrough: clickThrough ?? false,
    dwellTimeMs: dwellTimeMs ?? 0,
    returnLatencyMs: returnLatencyMs ?? 0,
    sessionContinuity: true,
    trustScore: profile?.trust_score ?? 50,
    actionFrequency: count ?? 0,
  };
}
