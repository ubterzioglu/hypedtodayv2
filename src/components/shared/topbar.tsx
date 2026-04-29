"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Coins, LogOut, Menu, User, Shield } from "lucide-react";
import Link from "next/link";
import type { Profile } from "@/types/database";

interface TopBarProps {
  profile: Profile | null;
}

export function TopBar({ profile }: TopBarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const initials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6">
      <div className="flex items-center gap-4 md:hidden">
        <Sheet>
          <SheetTrigger>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <MobileNav profile={profile} />
          </SheetContent>
        </Sheet>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        {profile && (
          <div className="flex items-center gap-2 text-sm">
            <Coins className="h-4 w-4 text-yellow-500" />
            <span className="font-medium">{profile.credits} credits</span>
          </div>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {profile && (
              <>
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{profile.full_name}</p>
                  <p className="text-xs text-muted-foreground">{profile.email}</p>
                </div>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={() => router.push("/profile")}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/credits")}>
              <Coins className="mr-2 h-4 w-4" />
              Credits
            </DropdownMenuItem>
            {profile?.is_admin && (
              <DropdownMenuItem onClick={() => router.push("/admin")}>
                <Shield className="mr-2 h-4 w-4" />
                Admin
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function MobileNav({ profile }: { profile: Profile | null }) {
  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/feed", label: "Feed" },
    { href: "/campaigns", label: "Campaigns" },
    { href: "/completions", label: "Completions" },
    { href: "/credits", label: "Credits" },
    { href: "/profile", label: "Profile" },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center h-16 px-6 border-b">
        <span className="font-bold text-lg">hyped.today</span>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center px-3 py-2 rounded-lg text-sm font-medium hover:bg-accent"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
