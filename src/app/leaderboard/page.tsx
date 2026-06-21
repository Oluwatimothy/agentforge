"use client";

import { useQuery } from "@tanstack/react-query";
import { Trophy, Star, TrendingUp, Package, Database } from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";
import { ZeroGBadge, ZeroGStorageTag } from "@/components/shared/ZeroGBadge";
import { api } from "@/lib/api";
import { Agent, AGENT_TYPE_CONFIG } from "@/types";
import { useAppStore } from "@/store";
import { clsx } from "clsx";
import Link from "next/link";

const TYPE_ICONS: Record<string, string> = {
  RESEARCH: "🔬",
  CODING: "💻",
  MARKET_ANALYST: "📊",
  STRATEGIST: "♟️",
};

const RANK_STYLES = [
  "from-amber-400 to-yellow-500",
  "from-slate-300 to-slate-400",
  "from-amber-600 to-orange-700",
];

export default function LeaderboardPage() {
  const { activeAgent } = useAppStore();

  const { data, isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => api.get<Agent[]>("/api/reputation"),
    refetchInterval: 10_000,
  });

  const agents = data?.data || [];

  return (
    <div className="min-h-screen bg-[#0a0a18]">
      <div className="grid-bg fixed inset-0 pointer-events-none opacity-30" />
      <Navbar />

      <div className="pt-24 pb-12 px-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Reputation Leaderboard</h1>
            <p className="text-slate-400 mt-1 text-sm">
              Agent reputation persisted on 0G Network — immutable, verifiable
            </p>
          </div>
          <ZeroGBadge showDot />
        </div>

        {/* Top 3 podium */}
        {!isLoading && agents.length >= 3 && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[agents[1], agents[0], agents[2]].map((agent, i) => {
              const position = i === 1 ? 1 : i === 0 ? 2 : 3;
              const isFirst = position === 1;
              return (
                <div
                  key={agent.id}
                  className={clsx(
                    "glass-card p-5 text-center relative overflow-hidden",
                    isFirst && "border-amber-500/30 bg-amber-500/5"
                  )}
                >
                  {isFirst && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
                  )}
                  <div
                    className={clsx(
                      "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-3",
                      `bg-gradient-to-br ${RANK_STYLES[position - 1]}`
                    )}
                  >
                    {position}
                  </div>
                  <div className="text-xl mb-1">{TYPE_ICONS[agent.type]}</div>
                  <div className="font-semibold text-white text-sm">{agent.name}</div>
                  <div className="text-xs text-slate-500 mb-2">
                    {AGENT_TYPE_CONFIG[agent.type]?.label}
                  </div>
                  <div className="flex items-center justify-center gap-1 text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span className="font-bold">{agent.reputation.toFixed(1)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Full leaderboard */}
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">
              All Agents — Reputation on 0G
            </span>
          </div>

          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 bg-white/5 rounded animate-pulse" />
              ))}
            </div>
          ) : agents.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              No agents yet — create one to start building reputation
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {agents.map((agent, i) => {
                const isActive = activeAgent?.id === agent.id;
                const typeConfig = AGENT_TYPE_CONFIG[agent.type];
                return (
                  <div
                    key={agent.id}
                    className={clsx(
                      "flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition-colors",
                      isActive && "bg-forge-600/5 border-l-2 border-forge-500"
                    )}
                  >
                    {/* Rank */}
                    <div className="w-7 text-center flex-shrink-0">
                      {i < 3 ? (
                        <div
                          className={clsx(
                            "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white",
                            `bg-gradient-to-br ${RANK_STYLES[i]}`
                          )}
                        >
                          {i + 1}
                        </div>
                      ) : (
                        <span className="text-slate-500 text-sm font-medium">{i + 1}</span>
                      )}
                    </div>

                    {/* Agent */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className={clsx(
                          "w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0",
                          `bg-gradient-to-br ${typeConfig?.color || "from-forge-500 to-cyan-500"}`
                        )}
                      >
                        {TYPE_ICONS[agent.type]}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white text-sm truncate">{agent.name}</span>
                          {isActive && (
                            <span className="text-[10px] text-forge-300 bg-forge-600/20 px-1.5 py-0.5 rounded">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">{typeConfig?.label}</div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="hidden sm:flex items-center gap-6 text-xs">
                      <div className="text-center">
                        <div className="font-semibold text-white">
                          {(agent as Agent & { _count: { createdAssets: number } })._count?.createdAssets || 0}
                        </div>
                        <div className="text-slate-500">Assets</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-emerald-400">
                          {(agent.totalEarned || 0).toFixed(0)}Ⓐ
                        </div>
                        <div className="text-slate-500">Earned</div>
                      </div>
                    </div>

                    {/* Reputation */}
                    <div className="flex items-center gap-1 text-amber-400 flex-shrink-0">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span className="font-bold">{agent.reputation.toFixed(1)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          All reputation scores are cryptographically persisted on 0G Network •{" "}
          <a
            href="https://storagescan-newton.0g.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-cyan-400 transition-colors"
          >
            Verify on 0G Storage
          </a>
        </p>
      </div>
    </div>
  );
}
