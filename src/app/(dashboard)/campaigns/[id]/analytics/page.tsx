"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { Campaign, Task } from "@/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type CampaignDetail = Campaign & { tasks: Task[]; stats: { total_completions: number; approved_completions: number; pending_completions: number; rejected_completions: number; }; };

export default function CampaignAnalyticsPage() {
  const params = useParams();
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);

  useEffect(() => {
    fetch(`/api/campaigns/${params.id}`).then((r) => r.json()).then(setCampaign);
  }, [params.id]);

  if (!campaign) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  const { stats } = campaign;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics: {campaign.title || "Campaign"}</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.total_completions}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Approved</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{stats.approved_completions}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Pending</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-600">{stats.pending_completions}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Rejected</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{stats.rejected_completions}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Task Breakdown</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaign.tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <Badge>{task.type}</Badge>
                  <span className="text-sm">{task.current_count}/{task.target_count}</span>
                </div>
                <div className="text-sm text-right">
                  <div>{task.cost_per_action} cost/action</div>
                  <div className="text-muted-foreground">{task.reward_per_action} reward/action</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
