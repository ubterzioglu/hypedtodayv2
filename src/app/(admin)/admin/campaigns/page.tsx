"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getStatusColor } from "@/lib/utils/helpers";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";

type AdminCampaign = {
  id: string;
  post_url: string;
  title: string | null;
  status: string;
  platform: string;
  total_cost: number;
  total_spent: number;
  created_at: string;
  profiles?: { full_name: string; email: string };
};

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<AdminCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadCampaigns(); }, []);

  const loadCampaigns = async () => {
    const res = await fetch("/api/admin/campaigns?limit=50");
    const data = await res.json();
    setCampaigns(data.campaigns || []);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">All Campaigns</h1>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Owner</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : campaigns.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="text-sm">{(c.profiles as Record<string, string>)?.full_name || "—"}</TableCell>
                  <TableCell className="font-medium">{c.title || c.post_url.slice(0, 40)}</TableCell>
                  <TableCell><Badge className={getStatusColor(c.status)}>{c.status}</Badge></TableCell>
                  <TableCell className="text-sm">{c.platform}</TableCell>
                  <TableCell className="text-sm">{c.total_cost}</TableCell>
                  <TableCell className="text-sm">{format(new Date(c.created_at), "MMM d, yyyy")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
