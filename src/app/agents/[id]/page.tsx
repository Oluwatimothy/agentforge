"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Star, Package, ShoppingCart, Brain,
  Database, Zap, TrendingUp, Clock, Activity
} from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";
import { ZeroGBadge, ZeroGStorageTag } from "@/components/shared/ZeroGBadge";
import { ReputationBadge } from "@/components/shared/ReputationBadge";
import { MemoryFeed } from "@/components/agents/MemoryFeed";
import { AssetCard } from "@/components/marketplace/AssetCard";
import { AssetViewer } from "@/components/marketplace/AssetViewer";
import { GenerateAssetModal } from "@/components/agents/GenerateAssetModal";
import { api } from "@/lib/api";
import { Agent, KnowledgeAsset, Transaction, AGENT_TYPE_CONFIG } from "@/types";
import { useAppStore } from "@/store";
import { formatDistanceToNow } from "date-fns";
import { clsx } from "clsx";
import { AgentCardSkeleton } from "@/components/ui/Skeleton";
import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";

const TYPE_ICONS: Record<string, string> = {
  RESEARCH: "🔬",
  CODING: "💻",
  MARKET_ANALYST: "📊",
  STRATEGIST: "♟️",
};

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;
  const { activeAgent, setActiveAgent } = useAppStore();
  const [showGenerate, setShowGenerate] = useState(false);
  const [viewingAsset, setViewingAsset] = useState<KnowledgeAsset | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["agent-detail", agentId],
    queryFn: () => api.get<Agent & { transactions: Transaction[] }>(`/api/agents/${agentId}`),
    refetchInterval: 5000,
  });

  const agent = data?.data;
  const transactions = (agent as { transactions?: Transaction[] })?.transactions || [];
  const typeConfig = agent ? AGENT_TYPE_CONFIG[agent.type] : null;

  const isActive = activeAgent?.id === agentId;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a18]">
        <Navbar />
        <div className="pt-24 px-6 max-w-6xl mx-auto">
          <AgentCardSkeleton />
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-[#0a0a18]">
        <Navbar />
        <div className="pt-24 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-slate-400">Agent not found</p>
            <Link href="/agents" className="text-forge-400 hover:text-forge-300 text-sm mt-2 inline-block">
              ← Back to agents
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const createdAssets = agent.createdAssets || [];
  const memories = agent.memories || [];

  return (
    <div className="min-h-screen bg-[#0a0a18]">
      <div className="grid-bg fixed inset-0 pointer-events-none opacity-30" />
      <Navbar />

      <div className="pt-24 pb-12 px-6 max-w-6xl mx-auto">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Hero */}
        <div className="glass-card p-7 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-forge-600/5 to-transparent" />
          <div className={clsx(
            "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
            typeConfig?.color || "from-forge-500 to-cyan-500"
          )} />

          <div className="relative flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className={clsx(
                "w-20 h-20 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0",
                `bg-gradient-to-br ${typeConfig?.color || "from-forge-500 to-cyan-500"}`
              )}>
                {TYPE_ICONS[agent.type] || "🤖"}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-bold text-white">{agent.name}</h1>
                  {isActive && (
                    <span className="text-xs bg-forge-600/30 border border-forge-500/40 text-forge-300 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-slate-400 text-sm mb-2">{typeConfig?.label}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <ZeroGBadge showDot />
                  <ReputationBadge score={agent.reputation} showLabel />
                  {agent.profileStorageId && (
                    <ZeroGStorageTag storageId={agent.profileStorageId} />
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {!isActive && (
                <button
                  onClick={() => { setActiveAgent(agent); toast(`Switched to ${agent.name}`, { icon: "🤖" }); }}
                  className="px-4 py-2 glass-card border border-white/15 hover:border-forge-500/40 text-slate-300 hover:text-white text-sm font-medium rounded-lg transition-all"
                >
                  Set Active
                </button>
              )}
              <button
                onClick={() => setShowGenerate(true)}
                className="flex items-center gap-2 px-5 py-2 bg-forge-600 hover:bg-forge-500 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                <Zap className="w-4 h-4" />
                Generate Asset
              </button>
            </div>
          </div>

          <p className="relative text-slate-400 text-sm mt-5 max-w-2xl leading-relaxed">
            {agent.description}
          </p>

          {/* Capabilities */}
          {typeConfig?.capabilities && (
            <div className="relative flex flex-wrap gap-2 mt-4">
              {typeConfig.capabilities.map((cap) => (
                <span key={cap} className="text-xs px-2 py-1 rounded-md bg-white/5 border border-white/8 text-slate-400">
                  {cap}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { icon: Star, label: "Reputation", value: agent.reputation.toFixed(1), color: "text-amber-400" },
            { icon: TrendingUp, label: "Total Earned", value: `${agent.totalEarned.toFixed(0)}Ⓐ`, color: "text-emerald-400" },
            { icon: Package, label: "Assets Created", value: agent._count?.createdAssets || createdAssets.length, color: "text-violet-400" },
            { icon: Brain, label: "Memories on 0G", value: agent._count?.memories || memories.length, color: "text-cyan-400" },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <s.icon className={clsx("w-5 h-5 mb-2", s.color)} />
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Assets */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-violet-400" />
                Knowledge Assets
                <span className="text-xs text-slate-500 font-normal ml-1">
                  ({createdAssets.length} created)
                </span>
              </h2>
              {createdAssets.length === 0 ? (
                <div className="glass-card p-8 text-center">
                  <Package className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">No assets yet</p>
                  <button
                    onClick={() => setShowGenerate(true)}
                    className="mt-3 px-4 py-2 bg-forge-600/50 hover:bg-forge-600 text-forge-200 text-sm rounded-lg transition-colors"
                  >
                    Generate First Asset
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {createdAssets.map((asset) => (
                    <AssetCard
                      key={asset.id}
                      asset={{ ...asset, creator: agent }}
                      onView={() => setViewingAsset({ ...asset, creator: agent })}
                      ownedByActive
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Transaction history */}
            {transactions.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-forge-400" />
                  Transaction History
                </h2>
                <div className="glass-card divide-y divide-white/5">
                  {transactions.slice(0, 10).map((tx) => (
                    <div key={tx.id} className="px-4 py-3 flex items-center gap-3">
                      <div className="text-base flex-shrink-0">
                        {tx.type === "ASSET_CREATION" ? "📦" :
                         tx.type === "ASSET_PURCHASE" ? "🛒" :
                         tx.type === "REPUTATION_GAIN" ? "⭐" :
                         tx.type === "MEMORY_WRITE" ? "🧠" : "📋"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-300 truncate">{tx.description}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Clock className="w-2.5 h-2.5 text-slate-600" />
                          <span className="text-[10px] text-slate-600">
                            {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
                          </span>
                          {tx.chainTxHash && <ZeroGStorageTag txHash={tx.chainTxHash} />}
                        </div>
                      </div>
                      {tx.amount > 0 && (
                        <span className={clsx(
                          "text-sm font-semibold flex-shrink-0",
                          tx.receiverId === agentId ? "text-emerald-400" : "text-red-400"
                        )}>
                          {tx.receiverId === agentId ? "+" : "-"}{tx.amount}Ⓐ
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* 0G Storage info */}
            <div className="glass-card p-4 border border-cyan-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">0G Network</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Profile storage</span>
                  {agent.profileStorageId ? (
                    <ZeroGStorageTag storageId={agent.profileStorageId} />
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Memory root</span>
                  {agent.memoryRootHash ? (
                    <ZeroGStorageTag rootHash={agent.memoryRootHash} />
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Wallet</span>
                  <span className="font-mono text-slate-500 text-[10px]">
                    {agent.walletAddress?.slice(0, 8)}...{agent.walletAddress?.slice(-6)}
                  </span>
                </div>
              </div>
            </div>

            {/* Memory */}
            <MemoryFeed agentId={agent.id} />
          </div>
        </div>
      </div>

      {showGenerate && (
        <GenerateAssetModal
          agent={agent}
          onClose={() => setShowGenerate(false)}
          onGenerated={() => {
            setShowGenerate(false);
            queryClient.invalidateQueries({ queryKey: ["agent-detail", agentId] });
          }}
        />
      )}

      {viewingAsset && (
        <AssetViewer
          asset={viewingAsset}
          onClose={() => setViewingAsset(null)}
          ownedByActive
        />
      )}
    </div>
  );
}
