"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { format } from "date-fns";

type AbuseFlag = {
  id: string;
  user_id: string | null;
  type: string;
  severity: string;
  status: string;
  meta: Record<string, unknown>;
  created_at: string;
  profiles?: { full_name: string; email: string };
};

export default function AdminAbusePage() {
  const [flags, setFlags] = useState<AbuseFlag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadFlags(); }, []);

  const loadFlags = async () => {
    const res = await fetch("/api/admin/abuse?limit=50");
    const data = await res.json();
    setFlags(data.flags || []);
    setLoading(false);
  };

  const getSeverityColor = (s: string) => {
    switch (s) {
      case "critical": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Abuse Flags</h1>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : flags.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No abuse flags</TableCell></TableRow>
              ) : flags.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="text-sm">{(f.profiles as Record<string, string>)?.full_name || "—"}</TableCell>
                  <TableCell><Badge variant="outline">{f.type}</Badge></TableCell>
                  <TableCell><Badge className={getSeverityColor(f.severity)}>{f.severity}</Badge></TableCell>
                  <TableCell><Badge variant="secondary">{f.status}</Badge></TableCell>
                  <TableCell className="text-sm">{format(new Date(f.created_at), "MMM d, HH:mm")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
