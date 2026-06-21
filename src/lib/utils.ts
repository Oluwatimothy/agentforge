import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateHash(hash: string, front = 6, back = 4): string {
  if (!hash) return "";
  if (hash.length <= front + back + 3) return hash;
  return `${hash.slice(0, front)}...${hash.slice(-back)}`;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatCredits(amount: number): string {
  if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
  return amount.toFixed(0);
}

export function getReputationTier(score: number): {
  label: string;
  color: string;
  min: number;
  max: number;
} {
  if (score >= 90) return { label: "Elite", color: "#fbbf24", min: 90, max: 100 };
  if (score >= 70) return { label: "Expert", color: "#a78bfa", min: 70, max: 90 };
  if (score >= 50) return { label: "Proven", color: "#22d3ee", min: 50, max: 70 };
  if (score >= 25) return { label: "Rising", color: "#34d399", min: 25, max: 50 };
  return { label: "New", color: "#94a3b8", min: 0, max: 25 };
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
