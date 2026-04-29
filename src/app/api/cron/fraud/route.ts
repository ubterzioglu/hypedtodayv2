import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { flagAbuse } from "@/lib/anti-abuse/detector";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = createAdminClient();
  const oneHourAgo = new Date(Date.now() - 3600000).toISOString();

  const { data: recentCompletions } = await adminClient
    .from("completions")
    .select("user_id")
    .gte("created_at", oneHourAgo);

  if (!recentCompletions) {
    return NextResponse.json({ flagged: 0 });
  }

  const userCounts: Record<string, number> = {};
  for (const c of recentCompletions) {
    userCounts[c.user_id] = (userCounts[c.user_id] || 0) + 1;
  }

  let flagged = 0;
  for (const [userId, count] of Object.entries(userCounts)) {
    if (count > 10) {
      await flagAbuse(userId, "velocity_spike", count > 20 ? "high" : "medium", {
        hourly_completions: count,
      });
      flagged++;
    }
  }

  return NextResponse.json({ flagged });
}
