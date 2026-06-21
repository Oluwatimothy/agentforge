"use client";

import { Brain, TrendingUp, Database, Package, Star } from "lucide-react";
import { Agent, AGENT_TYPE_CONFIG } from "@/types";
import { ZeroGStorageTag } from "@/components/shared/ZeroGBadge";
import { clsx } from "clsx";
import Link from "next/link";

interface AgentCardProps {
  agent: Agent;
  isActive?: boolean;
  onSelect?: (agent: Agent) => void;
  compact?: boolean;
}

const TYPE_ICONS: Record<string, string> = {
  RESEARCH: "🔬",
  CODING: "💻",
  MARKET_ANALYST: "📊",
  STRATEGIST: "♟️",
};

const STATUS_CONFIG = {
  IDLE: { label: "Idle", color: "bg-slate-500" },
  THINKING: { label: "Thinking", color: "bg-amber-400 animate-pulse" },
  GENERATING: { label: "Generating", color: "bg-forge-400 animate-pulse" },
  TRADING: { label: "Trading", color: "bg-emerald-400 animate-pulse" },
};

export function AgentCard({ agent, isActive, onSelect, compact }: AgentCardProps) {
  const typeConfig = AGENT_TYPE_CONFIG[agent.type];
  const statusConfig = STATUS_CONFIG[agent.status] || STATUS_CONFIG.IDLE;
  const assetCount = agent._count?.createdAssets ?? agent.createdAssets?.length ?? 0;
  const memoryCount = agent._count?.memories ?? agent.memories?.length ?? 0;

  return (
    <div
      onClick={() => onSelect?.(agent)}
      className={clsx(
        "glass-card p-5 cursor-pointer transition-all duration-300 group relative overflow-hidden",
        isActive
          ? "border-forge-500/50 bg-forge-600/10 glow-blue"
          : "hover:border-forge-500/30 hover:bg-forge-600/5",
        onSelect && "cursor-pointer"
      )}
    >
      {/* Active indicator */}
      {isActive && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-forge-500 to-transparent" />
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={clsx(
              "w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0",
              `bg-gradient-to-br ${typeConfig?.color || "from-forge-500 to-cyan-500"}`
            )}
          >
            {TYPE_ICONS[agent.type] || "🤖"}
          </div>
          <div>
            <h3 className="font-semibold text-white group-hover:text-forge-200 transition-colors">
              {agent.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={clsx(
                  "w-1.5 h-1.5 rounded-full flex-shrink-0",
                  statusConfig.color
                )}
              />
              <span className="text-xs text-slate-500">{statusConfig.label}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1 text-amber-400">
            <Star className="w-3 h-3 fill-amber-400" />
            <span className="text-sm font-semibold">{agent.reputation.toFixed(1)}</span>
          </div>
          {agent.profileStorageId && (
            <ZeroGStorageTag storageId={agent.profileStorageId} />
          )}
        </div>
      </div>

      {!compact && (
        <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed">
          {agent.description}
        </p>
      )}

      <div className="grid grid-cols-3 gap-2">
        <div className="text-center">
          <div className="text-sm font-semibold text-white">{assetCount}</div>
          <div className="text-[10px] text-slate-500">Assets</div>
        </div>
        <div className="text-center border-x border-white/5">
          <div className="text-sm font-semibold text-white">{memoryCount}</div>
          <div className="text-[10px] text-slate-500">Memories</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-semibold text-emerald-400">
            {agent.totalEarned.toFixed(0)}Ⓐ
          </div>
          <div className="text-[10px] text-slate-500">Earned</div>
        </div>
      </div>

      {isActive && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <div className="flex items-center gap-1 text-xs text-forge-400">
            <Brain className="w-3 h-3" />
            <span>Active agent</span>
          </div>
        </div>
      )}
    </div>
  );
}
