"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/helpers";
import {
  LayoutDashboard,
  Rss,
  Megaphone,
  CheckCircle2,
  Coins,
  User,
  Shield,
  Settings,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/feed", label: "Feed", icon: Rss },
  { href: "/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/completions", label: "Completions", icon: CheckCircle2 },
  { href: "/credits", label: "Credits", icon: Coins },
  { href: "/profile", label: "Profile", icon: User },
];

const adminItems = [
  { href: "/admin", label: "Admin Dashboard", icon: Shield },
  { href: "/admin/users", label: "Users", icon: Settings },
  { href: "/admin/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/admin/abuse", label: "Abuse Flags", icon: Shield },
];

interface SidebarProps {
  isAdmin?: boolean;
}

export function Sidebar({ isAdmin = false }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r bg-card">
      <div className="flex items-center h-16 px-6 border-b">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">H</span>
          </div>
          <span className="font-bold text-lg">hyped.today</span>
        </Link>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname === item.href || pathname?.startsWith(item.href + "/")
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
        {isAdmin && (
          <>
            <Separator className="my-4" />
            {adminItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === item.href || pathname?.startsWith(item.href + "/")
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </>
        )}
      </nav>
    </aside>
  );
}
