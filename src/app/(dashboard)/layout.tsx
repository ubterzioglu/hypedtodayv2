"use client";

import { Sidebar } from "@/components/shared/sidebar";
import { TopBar } from "@/components/shared/topbar";
import { AuthGuard, useProfile } from "@/components/shared/auth-guard";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const profile = useProfile();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isAdmin={profile?.is_admin} />
      <div className="md:pl-64 flex flex-col">
        <TopBar profile={profile} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <DashboardContent>{children}</DashboardContent>
    </AuthGuard>
  );
}
