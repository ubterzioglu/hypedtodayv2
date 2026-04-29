import { NextRequest, NextResponse } from "next/server";
import { batchRecalculateTrustScores } from "@/lib/trust/score";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const updated = await batchRecalculateTrustScores();

  return NextResponse.json({ success: true, updated });
}
