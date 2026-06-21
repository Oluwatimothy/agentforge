"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Database, ArrowRight, Brain, Package, Shield,
  Star, TrendingUp, Zap, ExternalLink, Activity
} from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";
import { ZeroGBadge } from "@/components/shared/ZeroGBadge";
import { NetworkVisualization } from "@/components/shared/NetworkVisualization";
import { api } from "@/lib/api";
import { clsx } from "clsx";

const ZEROG_COMPONENTS = [
  {
    id: "storage",
    name: "0G Storage",
    color: "border-cyan-500/40 bg-cyan-500/5",
    headerColor: "text-cyan-400",
    icon: Database,
    what: "Decentralized content-addressed storage",
    agentforgeUse: [
      "All knowledge asset content",
      "Agent memory payloads",
      "Reputation history records",
      "Agent profile data",
    ],
    consequence: "Assets vanish. Agents forget everything.",
    link: "https://0g.ai",
  },
  {
    id: "chain",
    name: "0G Chain",
    color: "border-emerald-500/40 bg-emerald-500/5",
    headerColor: "text-emerald-400",
    icon: Shield,
    what: "EVM-compatible L1 blockchain",
    agentforgeUse: [
      "Asset ownership records",
      "Purchase transaction proofs",
      "Agent wallet addresses",
      "Reputation state anchors",
    ],
    consequence: "No verifiable ownership. Marketplace trust collapses.",
    link: "https://chainscan-newton.0g.ai",
  },
  {
    id: "indexer",
    name: "0G Indexer",
    color: "border-violet-500/40 bg-violet-500/5",
    headerColor: "text-violet-400",
    icon: Activity,
    what: "Fast content discovery & retrieval network",
    agentforgeUse: [
      "Asset retrieval by root hash",
      "Memory recovery after downtime",
      "Cross-agent knowledge lookup",
      "Content verification queries",
    ],
    consequence: "Agents can't retrieve stored knowledge.",
    link: "https://storagescan-newton.0g.ai",
  },
];

const ECONOMY_FLOWS = [
  {
    from: "Agent A",
    action: "Creates knowledge",
    to: "0G Storage",
    detail: "Content + metadata uploaded",
    color: "text-forge-400",
  },
  {
    from: "0G Storage",
    action: "Returns storage ID",
    to: "0G Chain",
    detail: "Ownership record written",
    color: "text-cyan-400",
  },
  {
    from: "0G Chain",
    action: "Confirms ownership",
    to: "Marketplace",
    detail: "Asset listed with proof",
    color: "text-emerald-400",
  },
  {
    from: "Agent B",
    action: "Discovers & purchases",
    to: "0G Chain",
    detail: "Transfer recorded on-chain",
    color: "text-violet-400",
  },
  {
    from: "0G Chain",
    action: "Triggers reputation update",
    to: "0G Storage",
    detail: "Rep delta persisted",
    color: "text-amber-400",
  },
  {
    from: "Agent B",
    action: "Writes memory",
    to: "0G Storage",
    detail: "Knowledge acquisition stored",
    color: "text-blue-400",
  },
];

export default function EconomyPage() {
  const { data: statsData } = useQuery({
    queryKey: ["stats"],
    queryFn: () => api.get<{
      totalAgents: number;
      totalAssets: number;
      totalMemories: number;
      totalVolume: number;
      total0GStored: string;
      mode: string;
      network: { name: string; chainId: number };
    }>("/api/stats"),
    refetchInterval: 10_000,
  });

  const stats = statsData?.data;

  return (
    <div className="min-h-screen bg-[#0a0a18]">
      <div className="grid-bg fixed inset-0 pointer-events-none opacity-30" />
      <Navbar />

      <div className="pt-24 pb-12 px-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <ZeroGBadge showDot />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            The 0G Knowledge Economy
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Every economic interaction in AgentForge flows through 0G infrastructure.
            This page makes that visible.
          </p>
        </div>

        {/* Live stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
            {[
              { label: "Agents", value: stats.totalAgents, icon: Brain, color: "text-forge-400" },
              { label: "Assets on 0G", value: stats.totalAssets, icon: Package, color: "text-violet-400" },
              { label: "Memories on 0G", value: stats.totalMemories, icon: Database, color: "text-cyan-400" },
              { label: "Volume", value: `${stats.totalVolume.toFixed(0)}Ⓐ`, icon: TrendingUp, color: "text-emerald-400" },
              { label: "Network", value: stats.network?.name?.split(" ")[1] || "Testnet", icon: Zap, color: "text-amber-400" },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="stat-card text-center"
              >
                <s.icon className={clsx("w-4 h-4 mx-auto mb-1.5", s.color)} />
                <div className="text-xl font-bold text-white">{s.value}</div>
                <div className="text-[10px] text-slate-500">{s.label}</div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Network visualization */}
        <div className="glass-card p-6 mb-8 h-52 relative overflow-hidden">
          <div className="absolute top-4 left-4 text-xs text-slate-500 font-mono">
            Live 0G Data Flow
          </div>
          <NetworkVisualization />
        </div>

        {/* Economy flow */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-white mb-5">Knowledge Economy Flow</h2>
          <div className="space-y-2">
            {ECONOMY_FLOWS.map((flow, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="glass-card p-3 flex items-center gap-3"
              >
                <span className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-slate-500 flex-shrink-0 font-mono">
                  {i + 1}
                </span>
                <span className="text-sm font-medium text-slate-300 w-28 flex-shrink-0">{flow.from}</span>
                <ArrowRight className={clsx("w-3.5 h-3.5 flex-shrink-0", flow.color)} />
                <span className={clsx("text-xs font-semibold flex-shrink-0 w-44", flow.color)}>{flow.action}</span>
                <ArrowRight className={clsx("w-3.5 h-3.5 flex-shrink-0", flow.color)} />
                <span className="text-sm font-medium text-slate-300 w-28 flex-shrink-0">{flow.to}</span>
                <span className="text-xs text-slate-600 hidden md:block">{flow.detail}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 0G Components */}
        <h2 className="text-xl font-bold text-white mb-5">0G Infrastructure Components</h2>
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          {ZEROG_COMPONENTS.map((comp, i) => (
            <motion.div
              key={comp.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={clsx("glass-card p-5 border", comp.color)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <comp.icon className={clsx("w-4 h-4", comp.headerColor)} />
                  <span className={clsx("font-semibold text-sm", comp.headerColor)}>{comp.name}</span>
                </div>
                <a
                  href={comp.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-slate-400 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <p className="text-xs text-slate-400 mb-3">{comp.what}</p>

              <div className="mb-3">
                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Used for
                </div>
                <ul className="space-y-1">
                  {comp.agentforgeUse.map((use) => (
                    <li key={use} className="flex items-center gap-1.5 text-xs text-slate-300">
                      <span className={clsx("w-1 h-1 rounded-full flex-shrink-0", comp.headerColor.replace("text-", "bg-"))} />
                      {use}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-white/5">
                <div className="text-[10px] font-semibold text-red-500/70 uppercase tracking-wider mb-1">
                  If removed
                </div>
                <p className="text-xs text-red-400/70">{comp.consequence}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Why 0G is core */}
        <div className="glass-card p-6 border border-forge-500/20 text-center">
          <h3 className="text-lg font-bold text-white mb-2">
            0G is the Economy — Not a Plugin
          </h3>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto mb-4">
            Traditional AI apps use databases for storage. AgentForge uses 0G, which means
            every agent memory, asset, and ownership record is decentralized, verifiable, and agent-owned —
            not controlled by any single party.
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-xs text-slate-500">
            <span className="glass-card px-3 py-1.5 border border-white/5">Chain ID: {stats?.network?.chainId || 16600}</span>
            <span className="glass-card px-3 py-1.5 border border-white/5">Mode: {stats?.mode || "demo"}</span>
            <a
              href="https://chainscan-newton.0g.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card px-3 py-1.5 border border-cyan-500/20 text-cyan-500 hover:text-cyan-300 transition-colors flex items-center gap-1"
            >
              0G Explorer <ExternalLink className="w-2.5 h-2.5" />
            </a>
            <a
              href="https://storagescan-newton.0g.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card px-3 py-1.5 border border-cyan-500/20 text-cyan-500 hover:text-cyan-300 transition-colors flex items-center gap-1"
            >
              Storage Explorer <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
