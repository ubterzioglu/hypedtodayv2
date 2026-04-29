import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCredits(amount: number): string {
  return `${amount >= 0 ? "+" : ""}${amount} credits`;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function getPlatformIcon(platform: string): string {
  const icons: Record<string, string> = {
    linkedin: "Linkedin",
    x: "Twitter",
    instagram: "Instagram",
    youtube: "Youtube",
    tiktok: "TikTok",
    reddit: "Reddit",
  };
  return icons[platform] || "Globe";
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    paused: "bg-yellow-100 text-yellow-800",
    completed: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800",
    draft: "bg-gray-100 text-gray-800",
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function getTrustBadge(score: number): { label: string; color: string } {
  if (score >= 70) return { label: "Trusted", color: "text-green-600" };
  if (score >= 30) return { label: "Standard", color: "text-yellow-600" };
  return { label: "Low Trust", color: "text-red-600" };
}
