import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/auth/guards";

export async function GET(request: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = parseInt(searchParams.get("offset") || "0");

  const adminClient = createAdminClient();

  const { data, error: rpcError } = await adminClient.rpc("get_feed_tasks", {
    p_user_id: user!.id,
    p_limit: limit,
    p_offset: offset,
  });

  if (rpcError) {
    return NextResponse.json({ error: rpcError.message }, { status: 500 });
  }

  return NextResponse.json({
    tasks: data || [],
    limit,
    offset,
  });
}
