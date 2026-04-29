"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ACTION_COSTS } from "@/lib/utils/constants";
import { ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react";

type TaskInput = {
  type: "like" | "comment" | "repost" | "follow" | "connection_request" | "profile_visit";
  target_count: number;
  cost_per_action: number;
  reward_per_action: number;
};

const TASK_TYPES: TaskInput["type"][] = ["like", "comment", "repost", "follow", "connection_request", "profile_visit"];

export default function CreateCampaignPage() {
  const [step, setStep] = useState(0);
  const [postUrl, setPostUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tasks, setTasks] = useState<TaskInput[]>([
    { type: "like", target_count: 10, cost_per_action: 1, reward_per_action: 1 },
  ]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const totalCost = tasks.reduce((s, t) => s + t.target_count * t.cost_per_action, 0);
  const steps = ["Post URL", "Tasks", "Confirm"];

  const addTask = () => {
    const usedTypes = new Set(tasks.map((t) => t.type));
    const available = TASK_TYPES.find((t) => !usedTypes.has(t));
    if (available) {
      const defaults = ACTION_COSTS[available];
      setTasks([...tasks, { type: available, target_count: 10, cost_per_action: defaults.default, reward_per_action: defaults.default }]);
    }
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const updateTask = (index: number, field: keyof TaskInput, value: string | number) => {
    const updated = [...tasks];
    (updated[index] as Record<string, string | number>)[field] = value;
    setTasks(updated);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        post_url: postUrl,
        platform: "linkedin",
        title: title || undefined,
        description: description || undefined,
        pacing: "linear",
        visibility: "public",
        tasks,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Failed to create campaign");
      setLoading(false);
      return;
    }

    toast.success("Campaign created!");
    router.push("/campaigns");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Create Campaign</h1>
        <p className="text-muted-foreground">Launch an engagement campaign for your LinkedIn post</p>
      </div>

      <Progress value={((step + 1) / steps.length) * 100} className="h-2" />

      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Post URL</CardTitle>
            <CardDescription>Enter the LinkedIn post you want to boost</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="postUrl">LinkedIn Post URL</Label>
              <Input
                id="postUrl"
                placeholder="https://linkedin.com/posts/..."
                value={postUrl}
                onChange={(e) => setPostUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Campaign Title (optional)</Label>
              <Input id="title" placeholder="My campaign" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Description (optional)</Label>
              <Textarea id="desc" placeholder="What this campaign is about..." value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Tasks</CardTitle>
              <CardDescription>Define the engagement actions you want</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={addTask} disabled={tasks.length >= 6}>
              <Plus className="mr-2 h-4 w-4" />Add Task
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {tasks.map((task, i) => (
              <div key={i} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <Badge>{task.type}</Badge>
                  <Button variant="ghost" size="icon" onClick={() => removeTask(i)} disabled={tasks.length <= 1}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Target Count</Label>
                    <Input type="number" min={1} max={1000} value={task.target_count} onChange={(e) => updateTask(i, "target_count", parseInt(e.target.value) || 1)} />
                  </div>
                  <div>
                    <Label className="text-xs">Cost / Action</Label>
                    <Input type="number" min={1} max={100} value={task.cost_per_action} onChange={(e) => updateTask(i, "cost_per_action", parseInt(e.target.value) || 1)} />
                  </div>
                  <div>
                    <Label className="text-xs">Reward / Action</Label>
                    <Input type="number" min={1} max={100} value={task.reward_per_action} onChange={(e) => updateTask(i, "reward_per_action", parseInt(e.target.value) || 1)} />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Confirm Campaign</CardTitle>
            <CardDescription>Review and confirm your campaign</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Post URL</span><span className="truncate max-w-[300px]">{postUrl}</span></div>
              {title && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Title</span><span>{title}</span></div>}
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tasks</span><span>{tasks.length}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total Actions</span><span>{tasks.reduce((s, t) => s + t.target_count, 0)}</span></div>
              <hr className="my-2" />
              <div className="flex justify-between font-bold"><span>Total Cost</span><span>{totalCost} credits</span></div>
            </div>
            {tasks.map((t, i) => (
              <div key={i} className="flex items-center justify-between text-sm p-2 border rounded">
                <div className="flex items-center gap-2"><Badge variant="outline">{t.type}</Badge><span>{t.target_count} actions</span></div>
                <span>{t.target_count * t.cost_per_action} credits</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
          <ArrowLeft className="mr-2 h-4 w-4" />Back
        </Button>
        {step < steps.length - 1 ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={(step === 0 && !postUrl) || (step === 1 && tasks.length === 0)}>
            Next<ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating..." : "Create Campaign"}
          </Button>
        )}
      </div>
    </div>
  );
}
