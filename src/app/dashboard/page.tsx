"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import {
  Brain, TrendingUp, Package, ShoppingCart, Star, Database,
  Activity, Zap, ArrowUpRight, ArrowDownRight, Clock
} from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";
import { ZeroGBadge, ZeroGStorageTag } from "@/components/shared/ZeroGBadge";
import { MemoryFeed } from "@/components/agents/MemoryFeed";
import { api } from "@/lib/api";
import { Agent, Transaction, AGENT_TYPE_CONFIG, ASSET_TYPE_CONFIG } from "@/types";
import { useAppStore } from "@/store";
import { formatDistanceToNow } from "date-fns";
import { clsx } from "clsx";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar
} from "recharts";
import Link from "next/link";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const { activeAgent } = useAppStore();
  const agentId = searchParams.get("agent") || activeAgent?.id;

  const { data: agentData, isLoading } = useQuery({
    queryKey: ["agent-dashboard", agentId],
    queryFn: () => api.get<Agent & { transactions: Transaction[] }>(`/api/agents/${agentId}`),
    enabled: !!agentId,
    refetchInterval: 5000,
  });

  const agent = agentData?.data;
  const transactions = (agent as { transactions?: Transaction[] })?.transactions || [];

  // Build reputation history chart data from transactions
  const repChartData = transactions
    .filter((t) => t.type === "REPUTATION_GAIN" || t.type === "ASSET_CREATION" || t.type === "ASSET_PURCHASE")
    .slice(0, 10)
    .reverse()
    .map((t, i) => ({
      name: `T${i + 1}`,
      rep: 10 + i * 3,
      amount: t.amount,
    }));

  const TYPE_ICON: Record<string, string> = {
    ASSET_CREATION: "📦",
    ASSET_PURCHASE: "🛒",
    REPUTATION_GAIN: "⭐",
    MEMORY_WRITE: "🧠",
    MEMORY_READ: "👁️",
  };

  if (!agentId) {
    return (
      <div className="min-h-screen bg-[#0a0a18]">
        <Navbar />
        <div className="pt-24 flex items-center justify-center min-h-screen">
          <div className="text-center glass-card p-12 max-w-md">
            <Brain className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">No Agent Selected</h2>
            <p className="text-slate-400 text-sm mb-6">
              Create or select an agent to view their dashboard
            </p>
            <Link
              href="/agents"
              className="px-6 py-2.5 bg-forge-600 hover:bg-forge-500 text-white rounded-lg font-medium transition-colors"
            >
              Go to Agents
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || !agent) {
    return (
      <div className="min-h-screen bg-[#0a0a18]">
        <Navbar />
        <div className="pt-24 px-6 max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-white/5 rounded-2xl" />
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-white/5 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const typeConfig = AGENT_TYPE_CONFIG[agent.type];
  const createdAssets = agent.createdAssets || [];
  const ownedAssets = agent.ownedAssets || [];
  const activities = agent.activities || [];

  return (
    <div className="min-h-screen bg-[#0a0a18]">
      <div className="grid-bg fixed inset-0 pointer-events-none opacity-30" />
      <Navbar />

      <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        {/* Agent Header */}
        <div className="glass-card p-6 mb-6 border border-forge-500/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-forge-500 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-forge-600/5 to-transparent" />

          <div className="relative flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div
                className={clsx(
                  "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl",
                  `bg-gradient-to-br ${typeConfig?.color || "from-forge-500 to-cyan-500"}`
                )}
              >
                {agent.type === "RESEARCH" ? "🔬" : agent.type === "CODING" ? "💻" : agent.type === "MARKET_ANALYST" ? "📊" : "♟️"}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{agent.name}</h1>
                <p className="text-slate-400 text-sm">{typeConfig?.label}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <ZeroGBadge showDot />
                  {agent.profileStorageId && (
                    <ZeroGStorageTag storageId={agent.profileStorageId} />
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Reputation", value: agent.reputation.toFixed(1), icon: Star, color: "text-amber-400" },
                { label: "Earned", value: `${agent.totalEarned.toFixed(0)}Ⓐ`, icon: TrendingUp, color: "text-emerald-400" },
                { label: "Spent", value: `${agent.totalSpent.toFixed(0)}Ⓐ`, icon: ShoppingCart, color: "text-blue-400" },
                { label: "Assets Created", value: agent._count?.createdAssets || createdAssets.length, icon: Package, color: "text-violet-400" },
              ].map((stat) => (
                <div key={stat.label} className="glass-card p-3 text-center">
                  <stat.icon className={clsx("w-4 h-4 mx-auto mb-1", stat.color)} />
                  <div className="text-lg font-bold text-white">{stat.value}</div>
                  <div className="text-[10px] text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <p className="relative text-sm text-slate-400 mt-4 max-w-2xl">{agent.description}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Reputation chart */}
            {repChartData.length > 1 && (
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-white mb-4">Reputation History</h3>
                <ResponsiveContainer width="100%" height={120}>
                  <AreaChart data={repChartData}>
                    <defs>
                      <linearGradient id="repGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#5b6ef2" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#5b6ef2" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                    <Tooltip
                      contentStyle={{ background: "#0f0f23", border: "1px solid rgba(91,110,242,0.3)", borderRadius: 8 }}
                      labelStyle={{ color: "#94a3b8" }}
                    />
                    <Area type="monotone" dataKey="rep" stroke="#5b6ef2" fill="url(#repGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Created Assets */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Created Assets</h3>
                <span className="zerog-badge"><Database className="w-2.5 h-2.5" /> Stored on 0G</span>
              </div>
              {createdAssets.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-sm">
                  No assets created yet
                </div>
              ) : (
                <div className="space-y-2">
                  {createdAssets.map((asset) => (
                    <div key={asset.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/3 border border-white/5 hover:border-white/10 transition-colors">
                      <span className="text-lg">{ASSET_TYPE_CONFIG[asset.assetType]?.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{asset.title}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {asset.storageId && <ZeroGStorageTag storageId={asset.storageId} />}
                          <span className="text-[10px] text-slate-500">
                            Quality: {asset.qualityScore}/100
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-semibold text-white">{asset.price}Ⓐ</div>
                        <div className="text-[10px] text-slate-500">{asset.downloadCount} sales</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Owned Assets */}
            {ownedAssets.length > 0 && (
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-white mb-4">Acquired Assets</h3>
                <div className="space-y-2">
                  {ownedAssets.map((ownership) => {
                    const asset = ownership.asset;
                    if (!asset) return null;
                    return (
                      <div key={ownership.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/3 border border-white/5">
                        <span className="text-lg">{ASSET_TYPE_CONFIG[asset.assetType]?.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white truncate">{asset.title}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            From {asset.creator?.name || "Unknown"} •{" "}
                            {formatDistanceToNow(new Date(ownership.acquiredAt), { addSuffix: true })}
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-emerald-400">
                          +{ownership.pricePaid}Ⓐ
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Transaction History */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Transaction History</h3>
                <span className="text-xs text-slate-500">{transactions.length} records on 0G</span>
              </div>
              {transactions.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-sm">No transactions yet</div>
              ) : (
                <div className="space-y-2">
                  {transactions.slice(0, 15).map((tx) => (
                    <div key={tx.id} className="flex items-start gap-3 p-3 rounded-lg bg-white/3 border border-white/5">
                      <span className="text-base flex-shrink-0 mt-0.5">{TYPE_ICON[tx.type] || "📋"}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-slate-300 leading-snug">{tx.description}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-2.5 h-2.5 text-slate-600" />
                          <span className="text-[10px] text-slate-600">
                            {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
                          </span>
                          {tx.chainTxHash && (
                            <ZeroGStorageTag txHash={tx.chainTxHash} />
                          )}
                        </div>
                      </div>
                      {tx.amount > 0 && (
                        <div className={clsx(
                          "text-sm font-semibold flex-shrink-0",
                          tx.receiverId === agentId ? "text-emerald-400" : "text-red-400"
                        )}>
                          {tx.receiverId === agentId ? "+" : "-"}{tx.amount}Ⓐ
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* 0G Storage Stats */}
            <div className="glass-card p-4 border border-cyan-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                  0G Network Status
                </span>
              </div>
              <div className="space-y-2 text-xs">
                {[
                  { label: "Memory entries", value: agent._count?.memories || 0, color: "text-violet-400" },
                  { label: "Assets stored", value: agent._count?.createdAssets || 0, color: "text-forge-400" },
                  { label: "Ownership records", value: (agent._count?.createdAssets || 0) + (agent._count?.ownedAssets || 0), color: "text-emerald-400" },
                  { label: "Reputation records", value: transactions.filter(t => t.type === "REPUTATION_GAIN").length, color: "text-amber-400" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-slate-400">{item.label}</span>
                    <span className={clsx("font-semibold", item.color)}>{item.value}</span>
                  </div>
                ))}
              </div>
              {agent.memoryRootHash && (
                <div className="mt-3 pt-3 border-t border-white/5">
                  <div className="text-[10px] text-slate-600 mb-1">Memory Root Hash</div>
                  <ZeroGStorageTag rootHash={agent.memoryRootHash} />
                </div>
              )}
            </div>

            {/* Memory Feed */}
            <MemoryFeed agentId={agent.id} />

            {/* Activity Feed */}
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-forge-400" />
                <span className="text-xs font-semibold text-white">Activity</span>
              </div>
              <div className="space-y-2">
                {activities.slice(0, 8).map((activity) => (
                  <div key={activity.id} className="text-xs">
                    <div className="text-slate-300 leading-snug">{activity.description}</div>
                    <div className="text-slate-600 mt-0.5">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
