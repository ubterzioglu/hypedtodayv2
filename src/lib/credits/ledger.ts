import { createAdminClient } from "@/lib/supabase/admin";

export async function spendCredits(
  userId: string,
  amount: number,
  reason: string,
  refType: "completion" | "campaign" | "admin" | "system" = "campaign",
  refId?: string
): Promise<{ success: boolean; balance?: number }> {
  const supabase = createAdminClient();

  const { data, error } = await supabase.rpc("spend_credits", {
    p_user_id: userId,
    p_amount: amount,
    p_reason: reason,
    p_ref_type: refType,
    p_ref_id: refId || null,
  });

  if (error || !data) {
    return { success: false };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", userId)
    .single();

  return { success: true, balance: profile?.credits };
}

export async function earnCredits(
  userId: string,
  amount: number,
  reason: string,
  refType: "completion" | "campaign" | "admin" | "system" = "completion",
  refId?: string
): Promise<{ success: boolean; balance?: number }> {
  const supabase = createAdminClient();

  const { data, error } = await supabase.rpc("earn_credits", {
    p_user_id: userId,
    p_amount: amount,
    p_reason: reason,
    p_ref_type: refType,
    p_ref_id: refId || null,
  });

  if (error || !data) {
    return { success: false };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", userId)
    .single();

  return { success: true, balance: profile?.credits };
}

export async function refundCredits(
  userId: string,
  amount: number,
  reason: string,
  refId?: string
): Promise<{ success: boolean; balance?: number }> {
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", userId)
    .single();

  if (!profile) return { success: false };

  const newBalance = profile.credits + amount;

  await supabase
    .from("profiles")
    .update({ credits: newBalance })
    .eq("id", userId);

  await supabase.from("credit_transactions").insert({
    user_id: userId,
    amount,
    type: "refund",
    reason,
    ref_type: "campaign",
    ref_id: refId || null,
    balance_after: newBalance,
  });

  return { success: true, balance: newBalance };
}

export async function adjustCredits(
  userId: string,
  amount: number,
  reason: string
): Promise<{ success: boolean; balance?: number }> {
  const supabase = createAdminClient();

  const { data, error } = await supabase.rpc("adjust_credits", {
    p_user_id: userId,
    p_amount: amount,
    p_reason: reason,
  });

  if (error || !data) {
    return { success: false };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", userId)
    .single();

  return { success: true, balance: profile?.credits };
}
