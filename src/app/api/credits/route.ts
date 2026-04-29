import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/guards";

export async function GET() {
  const { profile, error } = await requireAuth();
  if (error) return error;

  return NextResponse.json({
    credits: profile!.credits,
    daily_limit: profile!.daily_limit,
    tasks_today: profile!.tasks_today,
    trust_score: profile!.trust_score,
  });
}
