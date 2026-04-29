import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { extensionEventSchema } from "@/lib/validators/schemas";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = extensionEventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 }
    );
  }

  const adminClient = createAdminClient();

  const { error } = await adminClient.from("events").insert({
    user_id: parsed.data.user_id,
    platform: parsed.data.platform,
    action: parsed.data.action,
    post_url: parsed.data.post_url,
    event_type: "extension",
    payload: parsed.data.payload || {},
    nonce: parsed.data.nonce || null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
