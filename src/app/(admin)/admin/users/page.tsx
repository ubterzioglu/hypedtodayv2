"use client";

import { useEffect, useState } from "react";
import type { Profile } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getTrustBadge } from "@/lib/utils/helpers";
import { format } from "date-fns";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [adjustUserId, setAdjustUserId] = useState<string | null>(null);
  const [adjustAmount, setAdjustAmount] = useState("0");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjusting, setAdjusting] = useState(false);

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async (searchTerm?: string) => {
    setLoading(true);
    const params = searchTerm ? `&search=${searchTerm}` : "";
    const res = await fetch(`/api/admin/users?limit=50${params}`);
    const data = await res.json();
    setUsers(data.users || []);
    setLoading(false);
  };

  const handleBan = async (userId: string, banned: boolean) => {
    const res = await fetch("/api/admin/ban", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, banned, reason: banned ? "Admin ban" : undefined }),
    });
    if (res.ok) { toast.success(banned ? "User banned" : "User unbanned"); loadUsers(search); }
    else toast.error("Failed to update");
  };

  const handleAdjustCredits = async () => {
    if (!adjustUserId) return;
    setAdjusting(true);
    const res = await fetch("/api/admin/adjust-credits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: adjustUserId, amount: parseInt(adjustAmount), reason: adjustReason }),
    });
    if (res.ok) { toast.success("Credits adjusted"); setAdjustUserId(null); loadUsers(search); }
    else toast.error("Failed to adjust");
    setAdjusting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Users</h1>
        <div className="flex gap-2">
          <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
          <Button onClick={() => loadUsers(search)}>Search</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Trust</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : users.map((u) => {
                const trust = getTrustBadge(u.trust_score);
                return (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.full_name}</TableCell>
                    <TableCell className="text-sm">{u.email}</TableCell>
                    <TableCell><span className={`text-sm ${trust.color}`}>{u.trust_score}</span></TableCell>
                    <TableCell>{u.credits}</TableCell>
                    <TableCell>{u.is_banned ? <Badge variant="destructive">Banned</Badge> : <Badge variant="secondary">Active</Badge>}</TableCell>
                    <TableCell className="text-sm">{format(new Date(u.created_at), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => handleBan(u.id, !u.is_banned)}>
                          {u.is_banned ? "Unban" : "Ban"}
                        </Button>
                        <Dialog open={adjustUserId === u.id} onOpenChange={(open) => { if (!open) setAdjustUserId(null); }}>
                          <DialogTrigger>
                            <Button variant="outline" size="sm" onClick={() => setAdjustUserId(u.id)}>Credits</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader><DialogTitle>Adjust Credits</DialogTitle></DialogHeader>
                            <div className="space-y-4">
                              <div><Label>Amount (negative to deduct)</Label><Input type="number" value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value)} /></div>
                              <div><Label>Reason</Label><Input value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} /></div>
                              <Button onClick={handleAdjustCredits} disabled={adjusting}>{adjusting ? "Adjusting..." : "Adjust"}</Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
