import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { onboardingSchema } from "@/lib/validators/schemas";

export async function PATCH(request: NextRequest) {
  const body = await request.json();

  const parsed = onboardingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      linkedin_url: parsed.data.linkedin_url || null,
      interests: parsed.data.interests,
      onboarding_completed: true,
    })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
