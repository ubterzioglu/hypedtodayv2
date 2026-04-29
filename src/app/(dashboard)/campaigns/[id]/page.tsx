"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Campaign, Task } from "@/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getStatusColor } from "@/lib/utils/helpers";
import { format } from "date-fns";
import { ExternalLink, Pause, Play, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

type CampaignDetail = Campaign & {
  tasks: Task[];
  stats: {
    total_completions: number;
    approved_completions: number;
    pending_completions: number;
    rejected_completions: number;
  };
};

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaign();
  }, []);

  const loadCampaign = async () => {
    const res = await fetch(`/api/campaigns/${params.id}`);
    if (res.ok) {
      setCampaign(await res.json());
    }
    setLoading(false);
  };

  const handlePauseResume = async () => {
    if (!campaign) return;
    const endpoint = campaign.status === "active" ? "pause" : "resume";
    const res = await fetch(`/api/campaigns/${campaign.id}/${endpoint}`, { method: "POST" });
    if (res.ok) {
      toast.success(`Campaign ${endpoint}d`);
      loadCampaign();
    }
  };

  if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (!campaign) return <div className="text-center py-8 text-muted-foreground">Campaign not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{campaign.title || "Campaign"}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge className={getStatusColor(campaign.status)}>{campaign.status}</Badge>
            <span className="text-muted-foreground">{campaign.platform}</span>
            <span className="text-muted-foreground">{format(new Date(campaign.created_at), "MMM d, yyyy")}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {(campaign.status === "active" || campaign.status === "paused") && (
            <Button variant="outline" onClick={handlePauseResume}>
              {campaign.status === "active" ? <><Pause className="mr-2 h-4 w-4" />Pause</> : <><Play className="mr-2 h-4 w-4" />Resume</>}
            </Button>
          )}
          <Link href={`/campaigns/${campaign.id}/analytics`}>
            <Button variant="outline"><BarChart3 className="mr-2 h-4 w-4" />Analytics</Button>
          </Link>
          <a href={campaign.post_url} target="_blank" rel="noopener noreferrer">
            <Button variant="outline"><ExternalLink className="mr-2 h-4 w-4" />Open Post</Button>
          </a>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Cost</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{campaign.total_cost}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Spent</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{campaign.total_spent}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Completions</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{campaign.stats.total_completions}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Approval Rate</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{campaign.stats.total_completions > 0 ? Math.round((campaign.stats.approved_completions / campaign.stats.total_completions) * 100) : 0}%</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Tasks</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {campaign.tasks.map((task) => {
            const progress = task.target_count > 0 ? Math.round((task.current_count / task.target_count) * 100) : 0;
            return (
              <div key={task.id} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge>{task.type}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {task.current_count} / {task.target_count}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Cost: {task.cost_per_action}</span>
                    <span className="mx-2">|</span>
                    <span className="text-muted-foreground">Reward: {task.reward_per_action}</span>
                  </div>
                </div>
                <Progress value={progress} />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
