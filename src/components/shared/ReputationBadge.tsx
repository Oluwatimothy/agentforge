"use client";

import { Star } from "lucide-react";
import { clsx } from "clsx";

interface ReputationBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function ReputationBadge({ score, size = "md", showLabel, className }: ReputationBadgeProps) {
  const tier =
    score >= 90 ? { label: "Elite", color: "text-amber-300 border-amber-400/40 bg-amber-400/10" } :
    score >= 70 ? { label: "Expert", color: "text-violet-300 border-violet-400/40 bg-violet-400/10" } :
    score >= 50 ? { label: "Proven", color: "text-cyan-300 border-cyan-400/40 bg-cyan-400/10" } :
    score >= 25 ? { label: "Rising", color: "text-emerald-300 border-emerald-400/40 bg-emerald-400/10" } :
    { label: "New", color: "text-slate-300 border-slate-400/40 bg-slate-400/10" };

  return (
    <div
      className={clsx(
        "inline-flex items-center gap-1 rounded-full border font-medium",
        size === "sm" && "px-1.5 py-0.5 text-[10px]",
        size === "md" && "px-2 py-1 text-xs",
        size === "lg" && "px-3 py-1.5 text-sm",
        tier.color,
        className
      )}
    >
      <Star className={clsx("fill-current", size === "sm" ? "w-2.5 h-2.5" : size === "lg" ? "w-4 h-4" : "w-3 h-3")} />
      <span>{score.toFixed(0)}</span>
      {showLabel && <span className="opacity-70">{tier.label}</span>}
    </div>
  );
}
