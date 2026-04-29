import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { submitCompletionSchema } from "@/lib/validators/schemas";
import { requireAuth } from "@/lib/auth/guards";
import { collectSignals } from "@/lib/verification/signals";
import { calculateVerificationScore } from "@/lib/verification/engine";
import { earnCredits } from "@/lib/credits/ledger";
import { checkDailyLimit, checkHourlyRate, checkRapidFire, recordUserAction } from "@/lib/anti-abuse/rate-limiter";
import { flagAbuse } from "@/lib/anti-abuse/detector";

export async function POST(request: NextRequest) {
  const { user, profile, error } = await requireAuth();
  if (error) return error;

  const body = await request.json();
  const parsed = submitCompletionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 }
    );
  }

  const adminClient = createAdminClient();

  const dailyCheck = await checkDailyLimit(user!.id);
  if (!dailyCheck.allowed) {
    return NextResponse.json({ error: "Daily limit reached" }, { status: 429 });
  }

  const hourlyCheck = await checkHourlyRate(user!.id);
  if (!hourlyCheck.allowed) {
    await flagAbuse(user!.id, "velocity_spike", "medium", { hourly_count: hourlyCheck.count });
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const isRapidFire = await checkRapidFire(user!.id);
  if (isRapidFire) {
    await flagAbuse(user!.id, "suspicious_pattern", "high");
    return NextResponse.json({ error: "Too many submissions too quickly" }, { status: 429 });
  }

  const { data: task } = await adminClient
    .from("tasks")
    .select("*, campaigns!inner(user_id, status)")
    .eq("id", parsed.data.task_id)
    .single();

  if (!task || !task.is_active) {
    return NextResponse.json({ error: "Task not found or inactive" }, { status: 404 });
  }

  if ((task.campaigns as Record<string, unknown>).status !== "active") {
    return NextResponse.json({ error: "Campaign is not active" }, { status: 400 });
  }

  if ((task.campaigns as Record<string, unknown>).user_id === user!.id) {
    return NextResponse.json({ error: "Cannot complete your own task" }, { status: 400 });
  }

  if (task.current_count >= task.target_count) {
    return NextResponse.json({ error: "Task already fully completed" }, { status: 400 });
  }

  const { count: existingCompletion } = await adminClient
    .from("completions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id)
    .eq("task_id", parsed.data.task_id);

  if ((existingCompletion ?? 0) > 0) {
    return NextResponse.json({ error: "Task already completed" }, { status: 409 });
  }

  const signals = await collectSignals(
    user!.id,
    parsed.data.dwell_time_ms,
    parsed.data.click_through,
    parsed.data.return_latency_ms
  );

  const verification = calculateVerificationScore(signals);

  const { data: completion, error: insertError } = await adminClient
    .from("completions")
    .insert({
      user_id: user!.id,
      task_id: parsed.data.task_id,
      campaign_id: parsed.data.campaign_id,
      status: verification.status,
      verification_score: verification.score,
      verification_source: "heuristic",
      dwell_time_ms: parsed.data.dwell_time_ms || null,
      click_through: parsed.data.click_through || false,
      return_latency_ms: parsed.data.return_latency_ms || null,
      rejection_reason: verification.reason || null,
    })
    .select()
    .single();

  if (insertError || !completion) {
    return NextResponse.json({ error: "Failed to record completion" }, { status: 500 });
  }

  if (verification.status === "approved") {
    await earnCredits(
      user!.id,
      task.reward_per_action,
      `Task reward: ${task.type}`,
      "completion",
      completion.id
    );

    await adminClient
      .from("tasks")
      .update({ current_count: task.current_count + 1 })
      .eq("id", task.id);

    await adminClient
      .from("campaigns")
      .update({ total_spent: (((task.campaigns as Record<string, unknown>).total_spent as number) || 0) + task.cost_per_action })
      .eq("id", parsed.data.campaign_id);
  }

  await adminClient.rpc("update_trust_score", { target_user_id: user!.id });

  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined;
  const userAgent = request.headers.get("user-agent") || undefined;
  await recordUserAction(user!.id, "task_completion", {
    ipAddress: ip,
    userAgent,
  });

  return NextResponse.json({
    completion,
    verification: {
      score: verification.score,
      status: verification.status,
      reason: verification.reason,
    },
    credits_awarded: verification.status === "approved" ? task.reward_per_action : 0,
  });
}
