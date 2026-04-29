import { NextRequest, NextResponse } from "next/server";
import { adminAdjustCreditsSchema } from "@/lib/validators/schemas";
import { adjustCredits } from "@/lib/credits/ledger";
import { requireAdmin } from "@/lib/auth/guards";

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await request.json();
  const parsed = adminAdjustCreditsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 }
    );
  }

  const result = await adjustCredits(
    parsed.data.user_id,
    parsed.data.amount,
    parsed.data.reason
  );

  if (!result.success) {
    return NextResponse.json({ error: "Failed to adjust credits" }, { status: 500 });
  }

  return NextResponse.json({ success: true, balance: result.balance });
}
