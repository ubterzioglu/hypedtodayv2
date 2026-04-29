"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Megaphone, CheckCircle2, ShieldAlert } from "lucide-react";

type AdminStats = {
  totalUsers: number;
  totalCampaigns: number;
  totalCompletions: number;
  openFlags: number;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats>({ totalUsers: 0, totalCampaigns: 0, totalCompletions: 0, openFlags: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/users?limit=1").then((r) => r.json()),
      fetch("/api/admin/campaigns?limit=1").then((r) => r.json()),
      fetch("/api/admin/abuse?limit=1").then((r) => r.json()),
    ]).then(([users, campaigns, abuse]) => {
      setStats({
        totalUsers: users.total || 0,
        totalCampaigns: campaigns.total || 0,
        totalCompletions: 0,
        openFlags: abuse.total || 0,
      });
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.totalUsers}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.totalCampaigns}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Flags</CardTitle>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.openFlags}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completions</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.totalCompletions}</div></CardContent>
        </Card>
      </div>
    </div>
  );
}
