import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { earnCredits } from "@/lib/credits/ledger";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = createAdminClient();

  const fiveMinutesAgo = new Date(Date.now() - 300000).toISOString();

  const { data: pendingCompletions } = await adminClient
    .from("completions")
    .select("*, tasks!inner(reward_per_action, cost_per_action, current_count, target_count, campaign_id)")
    .eq("status", "pending")
    .lt("created_at", fiveMinutesAgo)
    .limit(100);

  if (!pendingCompletions || pendingCompletions.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  let approved = 0;
  let rejected = 0;

  for (const completion of pendingCompletions) {
    const task = completion.tasks as Record<string, unknown>;
    const shouldApprove = completion.verification_score >= 0.50;

    if (shouldApprove) {
      await adminClient
        .from("completions")
        .update({
          status: "approved",
          verification_source: "heuristic",
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", completion.id);

      await earnCredits(
        completion.user_id,
        task.reward_per_action as number,
        `Task reward (batch): ${(task as Record<string, unknown>).type}`,
        "completion",
        completion.id
      );

      await adminClient
        .from("tasks")
        .update({ current_count: (task.current_count as number) + 1 })
        .eq("id", completion.task_id);

      approved++;
    } else {
      await adminClient
        .from("completions")
        .update({
          status: "rejected",
          rejection_reason: "Failed batch verification",
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", completion.id);

      rejected++;
    }
  }

  return NextResponse.json({ processed: pendingCompletions.length, approved, rejected });
}
