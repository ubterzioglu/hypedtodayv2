"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { getStatusColor } from "@/lib/utils/helpers";

type CompletionRow = {
  id: string;
  status: string;
  verification_score: number;
  created_at: string;
  tasks?: { type: string; reward_per_action: number };
  campaigns?: { title: string; post_url: string };
};

export default function CompletionsPage() {
  const [completions, setCompletions] = useState<CompletionRow[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompletions();
  }, [status]);

  const loadCompletions = async () => {
    setLoading(true);
    const params = status ? `?status=${status}` : "";
    const res = await fetch(`/api/completions/me${params}`);
    const data = await res.json();
    setCompletions(data.completions || []);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Completions</h1>
        <p className="text-muted-foreground">Your task completion history</p>
      </div>

      <Tabs value={status || "all"} onValueChange={(v) => setStatus(v === "all" ? "" : v)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Reward</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : completions.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No completions found</TableCell></TableRow>
              ) : (
                completions.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="text-sm">{format(new Date(c.created_at), "MMM d, HH:mm")}</TableCell>
                    <TableCell className="text-sm truncate max-w-[200px]">{c.campaigns?.title || "—"}</TableCell>
                    <TableCell><Badge variant="outline">{String((c.tasks as Record<string, unknown>)?.type || "—")}</Badge></TableCell>
                    <TableCell><Badge className={getStatusColor(c.status)}>{c.status}</Badge></TableCell>
                    <TableCell className="text-sm">{(c.verification_score * 100).toFixed(0)}%</TableCell>
                    <TableCell className="text-sm">+{((c.tasks as Record<string, unknown>)?.reward_per_action as number) || 0}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
