"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Campaign, Task } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getStatusColor } from "@/lib/utils/helpers";
import { format } from "date-fns";
import { Plus, ExternalLink, Pause, Play } from "lucide-react";
import { toast } from "sonner";

type CampaignWithTasks = Campaign & { tasks: Task[] };

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignWithTasks[]>([]);
  const [status, setStatus] = useState("active");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaigns();
  }, [status]);

  const loadCampaigns = async () => {
    setLoading(true);
    const res = await fetch(`/api/campaigns?status=${status}`);
    const data = await res.json();
    setCampaigns(data.campaigns || []);
    setLoading(false);
  };

  const handlePauseResume = async (id: string, currentStatus: string) => {
    const endpoint = currentStatus === "active" ? "pause" : "resume";
    const res = await fetch(`/api/campaigns/${id}/${endpoint}`, { method: "POST" });
    if (res.ok) {
      toast.success(`Campaign ${endpoint}d`);
      loadCampaigns();
    } else {
      toast.error("Failed to update campaign");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground">Manage your engagement campaigns</p>
        </div>
        <Link href="/campaigns/create">
          <Button><Plus className="mr-2 h-4 w-4" />Create Campaign</Button>
        </Link>
      </div>

      <Tabs value={status} onValueChange={setStatus}>
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="paused">Paused</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      ) : campaigns.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No {status} campaigns</CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((c) => {
            const totalTasks = c.tasks?.length || 0;
            const totalTarget = c.tasks?.reduce((s, t) => s + t.target_count, 0) || 0;
            const totalCompleted = c.tasks?.reduce((s, t) => s + t.current_count, 0) || 0;
            const progress = totalTarget > 0 ? Math.round((totalCompleted / totalTarget) * 100) : 0;

            return (
              <Card key={c.id}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{c.title || c.post_url}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge className={getStatusColor(c.status)}>{c.status}</Badge>
                      <span>{c.platform}</span>
                      <span>{format(new Date(c.created_at), "MMM d, yyyy")}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {(c.status === "active" || c.status === "paused") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePauseResume(c.id, c.status)}
                      >
                        {c.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                    )}
                    <Link href={`/campaigns/${c.id}`}>
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                    <a href={c.post_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon"><ExternalLink className="h-4 w-4" /></Button>
                    </a>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div><span className="text-muted-foreground">Tasks:</span> {totalTasks}</div>
                    <div><span className="text-muted-foreground">Cost:</span> {c.total_cost} credits</div>
                    <div><span className="text-muted-foreground">Spent:</span> {c.total_spent} credits</div>
                    <div><span className="text-muted-foreground">Progress:</span> {progress}%</div>
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
