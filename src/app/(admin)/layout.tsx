"use client";

import { AdminGuard } from "@/components/shared/admin-guard";
import { Sidebar } from "@/components/shared/sidebar";
import { TopBar } from "@/components/shared/topbar";
import { useProfile } from "@/components/shared/auth-guard";

function AdminContent({ children }: { children: React.ReactNode }) {
  const profile = useProfile();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isAdmin={true} />
      <div className="md:pl-64 flex flex-col">
        <TopBar profile={profile} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <AdminContent>{children}</AdminContent>
    </AdminGuard>
  );
}
