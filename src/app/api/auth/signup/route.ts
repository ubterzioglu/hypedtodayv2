import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { signupSchema } from "@/lib/validators/schemas";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 }
    );
  }

  const { email, password, full_name } = parsed.data;

  const supabase = createAdminClient();

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: false,
    user_metadata: { full_name },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!data.user) {
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }

  return NextResponse.json({
    user: { id: data.user.id, email: data.user.email },
    needsConfirmation: !data.user.email_confirmed_at,
  });
}
