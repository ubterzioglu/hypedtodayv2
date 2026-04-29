import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/guards";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("user_id, status")
    .eq("id", id)
    .single();

  if (!campaign || campaign.user_id !== user!.id) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  if (campaign.status !== "active") {
    return NextResponse.json({ error: "Only active campaigns can be paused" }, { status: 400 });
  }

  const { error: updateError } = await supabase
    .from("campaigns")
    .update({ status: "paused" })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, status: "paused" });
}
