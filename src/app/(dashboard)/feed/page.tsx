"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ExternalLink, CheckCircle2, Loader2, Coins } from "lucide-react";

type FeedTask = {
  task_id: string;
  campaign_id: string;
  campaign_title: string | null;
  campaign_description: string | null;
  task_type: string;
  target_count: number;
  current_count: number;
  reward_per_action: number;
  cost_per_action: number;
  platform: string;
  post_url: string;
  score: number;
};

type ActiveTask = { taskId: string; startTime: number };

export default function FeedPage() {
  const [tasks, setTasks] = useState<FeedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<ActiveTask | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = async () => {
    const res = await fetch("/api/feed?limit=20");
    const data = await res.json();
    setTasks(data.tasks || []);
    setLoading(false);
  };

  const handleOpen = (task: FeedTask) => {
    setActiveTask({ taskId: task.task_id, startTime: Date.now() });
    window.open(task.post_url, "_blank");
  };

  const handleComplete = async (task: FeedTask) => {
    if (!activeTask || activeTask.taskId !== task.task_id) return;
    setSubmitting(true);

    const dwellTime = Date.now() - activeTask.startTime;
    const returnLatency = Date.now() - activeTask.startTime;

    const res = await fetch("/api/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        task_id: task.task_id,
        campaign_id: task.campaign_id,
        dwell_time_ms: dwellTime,
        click_through: true,
        return_latency_ms: returnLatency,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      toast.success(
        data.credits_awarded > 0
          ? `Task completed! +${data.credits_awarded} credits`
          : `Task submitted for verification`
      );
      setTasks((prev) => prev.filter((t) => t.task_id !== task.task_id));
      setActiveTask(null);
    } else {
      toast.error(data.error || "Failed to submit");
    }
    setSubmitting(false);
  };

  if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Feed</h1>
        <p className="text-muted-foreground">Complete tasks to earn credits</p>
      </div>

      {tasks.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No tasks available right now. Check back later!</CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {tasks.map((task) => {
            const isActive = activeTask?.taskId === task.task_id;
            const progress = task.target_count > 0 ? Math.round((task.current_count / task.target_count) * 100) : 0;

            return (
              <Card key={task.task_id} className={isActive ? "ring-2 ring-primary" : ""}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                  <div>
                    <CardTitle className="text-lg">{task.campaign_title || "Untitled Campaign"}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{task.platform}</Badge>
                      <Badge>{task.task_type}</Badge>
                      <span className="text-xs text-muted-foreground">{progress}% filled</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Coins className="h-4 w-4 text-yellow-500" />
                    <span className="font-bold">+{task.reward_per_action}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    {!isActive ? (
                      <Button onClick={() => handleOpen(task)}>
                        <ExternalLink className="mr-2 h-4 w-4" />Open Post
                      </Button>
                    ) : (
                      <Button onClick={() => handleComplete(task)} disabled={submitting}>
                        {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                        {submitting ? "Submitting..." : "I Did It"}
                      </Button>
                    )}
                    {isActive && (
                      <Button variant="ghost" onClick={() => setActiveTask(null)}>Cancel</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
