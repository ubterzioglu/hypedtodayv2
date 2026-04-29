import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/auth/guards";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const adminClient = createAdminClient();

  const { data: campaign, error: campaignError } = await adminClient
    .from("campaigns")
    .select("*, tasks(*)")
    .eq("id", id)
    .single();

  if (campaignError || !campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  if (campaign.user_id !== user!.id && campaign.status !== "active") {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  const { count: totalCompletions } = await adminClient
    .from("completions")
    .select("*", { count: "exact", head: true })
    .eq("campaign_id", id);

  const { count: approvedCompletions } = await adminClient
    .from("completions")
    .select("*", { count: "exact", head: true })
    .eq("campaign_id", id)
    .eq("status", "approved");

  const { count: pendingCompletions } = await adminClient
    .from("completions")
    .select("*", { count: "exact", head: true })
    .eq("campaign_id", id)
    .eq("status", "pending");

  const { count: rejectedCompletions } = await adminClient
    .from("completions")
    .select("*", { count: "exact", head: true })
    .eq("campaign_id", id)
    .eq("status", "rejected");

  return NextResponse.json({
    ...campaign,
    stats: {
      total_completions: totalCompletions ?? 0,
      approved_completions: approvedCompletions ?? 0,
      pending_completions: pendingCompletions ?? 0,
      rejected_completions: rejectedCompletions ?? 0,
    },
  });
}
