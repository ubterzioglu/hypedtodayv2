import { getCurrentUser } from "./middleware";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      ),
    };
  }

  if (profile.is_banned) {
    return {
      user: null,
      error: NextResponse.json({ error: "Account banned" }, { status: 403 }),
    };
  }

  return { user, profile, error: null };
}

export async function requireAdmin() {
  const result = await requireAuth();
  if (result.error) return result;

  if (!result.profile?.is_admin) {
    return {
      user: null,
      profile: null,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return result;
}
