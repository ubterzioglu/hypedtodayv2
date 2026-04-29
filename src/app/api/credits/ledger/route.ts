import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/guards";

export async function GET(request: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = (page - 1) * limit;

  const supabase = await createClient();

  const { data, count, error: queryError } = await supabase
    .from("credit_transactions")
    .select("*", { count: "exact" })
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 500 });
  }

  return NextResponse.json({
    transactions: data,
    total: count,
    page,
    limit,
  });
}
