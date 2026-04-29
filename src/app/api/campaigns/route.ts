import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createCampaignSchema } from "@/lib/validators/schemas";
import { spendCredits } from "@/lib/credits/ledger";
import { calculateCampaignCost } from "@/lib/credits/policies";
import { requireAuth } from "@/lib/auth/guards";

export async function POST(request: NextRequest) {
  const { user, profile, error } = await requireAuth();
  if (error) return error;

  const body = await request.json();
  const parsed = createCampaignSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const totalCost = calculateCampaignCost(data.tasks);

  if (totalCost <= 0) {
    return NextResponse.json({ error: "Campaign must have a cost greater than 0" }, { status: 400 });
  }

  if (!profile || profile.credits < totalCost) {
    return NextResponse.json({ error: "Insufficient credits" }, { status: 400 });
  }

  const adminClient = createAdminClient();

  const { data: campaign, error: campaignError } = await adminClient
    .from("campaigns")
    .insert({
      user_id: user.id,
      platform: data.platform,
      post_url: data.post_url,
      title: data.title || null,
      description: data.description || null,
      pacing: data.pacing,
      visibility: data.visibility,
      targeting: data.targeting || {},
      total_cost: totalCost,
      status: "active",
    })
    .select()
    .single();

  if (campaignError || !campaign) {
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
  }

  const tasks = data.tasks.map((t) => ({
    campaign_id: campaign.id,
    type: t.type,
    target_count: t.target_count,
    cost_per_action: t.cost_per_action,
    reward_per_action: t.reward_per_action,
  }));

  const { error: tasksError } = await adminClient.from("tasks").insert(tasks);

  if (tasksError) {
    await adminClient.from("campaigns").delete().eq("id", campaign.id);
    return NextResponse.json({ error: "Failed to create tasks" }, { status: 500 });
  }

  const creditResult = await spendCredits(
    user.id,
    totalCost,
    `Campaign: ${data.title || data.post_url}`,
    "campaign",
    campaign.id
  );

  if (!creditResult.success) {
    await adminClient.from("campaigns").delete().eq("id", campaign.id);
    return NextResponse.json({ error: "Failed to deduct credits" }, { status: 500 });
  }

  const { data: fullCampaign } = await adminClient
    .from("campaigns")
    .select("*, tasks(*)")
    .eq("id", campaign.id)
    .single();

  return NextResponse.json(fullCampaign, { status: 201 });
}

export async function GET(request: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = (page - 1) * limit;

  const supabase = await createClient();

  let query = supabase
    .from("campaigns")
    .select("*, tasks(*)", { count: "exact" })
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, count, error: queryError } = await query;

  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 500 });
  }

  return NextResponse.json({
    campaigns: data,
    total: count,
    page,
    limit,
  });
}
