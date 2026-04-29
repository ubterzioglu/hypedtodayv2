import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminModerateSchema } from "@/lib/validators/schemas";
import { earnCredits } from "@/lib/credits/ledger";
import { requireAdmin } from "@/lib/auth/guards";

export async function POST(request: NextRequest) {
  const { profile: adminProfile, error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const parsed = adminModerateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 }
    );
  }

  const adminClient = createAdminClient();

  const { data: completion } = await adminClient
    .from("completions")
    .select("*, tasks!inner(reward_per_action)")
    .eq("id", parsed.data.completion_id)
    .single();

  if (!completion) {
    return NextResponse.json({ error: "Completion not found" }, { status: 404 });
  }

  if (parsed.data.action === "approve") {
    await adminClient
      .from("completions")
      .update({
        status: "approved",
        verification_source: "manual",
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminProfile!.id,
        rejection_reason: null,
      })
      .eq("id", parsed.data.completion_id);

    const task = completion.tasks as Record<string, unknown>;
    await earnCredits(
      completion.user_id,
      task.reward_per_action as number,
      "Task reward (manual approval)",
      "completion",
      completion.id
    );
  } else {
    await adminClient
      .from("completions")
      .update({
        status: "rejected",
        verification_source: "manual",
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminProfile!.id,
        rejection_reason: parsed.data.reason || "Rejected by admin",
      })
      .eq("id", parsed.data.completion_id);
  }

  return NextResponse.json({ success: true });
}
