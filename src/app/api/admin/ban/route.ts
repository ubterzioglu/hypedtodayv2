import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminBanSchema } from "@/lib/validators/schemas";
import { requireAdmin } from "@/lib/auth/guards";

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const parsed = adminBanSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 }
    );
  }

  const adminClient = createAdminClient();

  if (parsed.data.banned) {
    const { error: updateError } = await adminClient
      .from("profiles")
      .update({
        is_banned: true,
        banned_at: new Date().toISOString(),
        banned_reason: parsed.data.reason || null,
      })
      .eq("id", parsed.data.user_id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  } else {
    const { error: updateError } = await adminClient
      .from("profiles")
      .update({
        is_banned: false,
        banned_at: null,
        banned_reason: null,
      })
      .eq("id", parsed.data.user_id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
