"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Campaign, CreditTransaction } from "@/types/database";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Coins, TrendingUp, Shield, Megaphone, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { getStatusColor, getTrustBadge } from "@/lib/utils/helpers";
import Link from "next/link";

type DashboardStats = {
  total_completions: number;
  approved: number;
  rejected: number;
  total_earned: number;
  total_spent: number;
  active_campaigns: number;
};

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    total_completions: 0,
    approved: 0,
    rejected: 0,
    total_earned: 0,
    total_spent: 0,
    active_campaigns: 0,
  });
  const [recentCompletions, setRecentCompletions] = useState<
    (CreditTransaction & { tasks?: { type: string } })[]
  >([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: p } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    setProfile(p);

    const [completionsRes, earnedRes, spentRes, campaignsRes] = await Promise.all([
      supabase.from("completions").select("status", { count: "exact" }).eq("user_id", user.id),
      supabase
        .from("credit_transactions")
        .select("amount")
        .eq("user_id", user.id)
        .eq("type", "earn"),
      supabase
        .from("credit_transactions")
        .select("amount")
        .eq("user_id", user.id)
        .eq("type", "spend"),
      supabase
        .from("campaigns")
        .select("id", { count: "exact" })
        .eq("user_id", user.id)
        .eq("status", "active"),
    ]);

    const completions = completionsRes.data || [];
    const approved = completions.filter((c) => c.status === "approved").length;
    const rejected = completions.filter((c) => c.status === "rejected").length;
    const totalEarned = (earnedRes.data || []).reduce((s, t) => s + t.amount, 0);
    const totalSpent = Math.abs((spentRes.data || []).reduce((s, t) => s + t.amount, 0));

    setStats({
      total_completions: completionsRes.count ?? 0,
      approved,
      rejected,
      total_earned: totalEarned,
      total_spent: totalSpent,
      active_campaigns: campaignsRes.count ?? 0,
    });

    const { data: recent } = await supabase
      .from("credit_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    setRecentCompletions((recent as (CreditTransaction & { tasks?: { type: string } })[]) || []);
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const trustBadge = getTrustBadge(profile.trust_score);
  const approvalRate =
    stats.total_completions > 0
      ? Math.round((stats.approved / stats.total_completions) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {profile.full_name}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credits</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.credits}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.total_earned} earned / -{stats.total_spent} spent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trust Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile.trust_score}/100</div>
            <p className={`text-xs ${trustBadge.color}`}>{trustBadge.label}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_completions}</div>
            <p className="text-xs text-muted-foreground">
              {approvalRate}% approval rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active_campaigns}</div>
            <Link href="/campaigns/create" className="text-xs text-primary underline">
              Create new
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Daily Progress</CardTitle>
            <CardDescription>
              {profile.tasks_today} / {profile.daily_limit} tasks today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={(profile.tasks_today / profile.daily_limit) * 100} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentCompletions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              ) : (
                recentCompletions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{tx.reason}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(tx.created_at), "MMM d, HH:mm")}
                      </p>
                    </div>
                    <Badge variant={tx.amount > 0 ? "default" : "secondary"}>
                      {tx.amount > 0 ? "+" : ""}
                      {tx.amount}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
