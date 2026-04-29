import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/auth/guards";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const adminClient = createAdminClient();

  const { data: task, error: taskError } = await adminClient
    .from("tasks")
    .select("*, campaigns(*)")
    .eq("id", id)
    .single();

  if (taskError || !task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const { count: completedByUser } = await adminClient
    .from("completions")
    .select("*", { count: "exact", head: true })
    .eq("task_id", id)
    .eq("user_id", user!.id);

  return NextResponse.json({
    ...task,
    already_completed: (completedByUser ?? 0) > 0,
  });
}
