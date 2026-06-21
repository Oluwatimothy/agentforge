"use client";

import { useQuery } from "@tanstack/react-query";
import { Database, Brain, Clock } from "lucide-react";
import { api } from "@/lib/api";
import { AgentMemory } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { ZeroGStorageTag } from "@/components/shared/ZeroGBadge";

interface MemoryFeedProps {
  agentId: string;
}

const MEMORY_TYPE_ICONS: Record<string, string> = {
  initialization: "🌱",
  asset_creation: "📦",
  asset_acquired: "🛒",
  task_completion: "✅",
  trade_executed: "💰",
  general: "💭",
};

export function MemoryFeed({ agentId }: MemoryFeedProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["memories", agentId],
    queryFn: () => api.get<AgentMemory[]>(`/api/memory?agentId=${agentId}`),
    refetchInterval: 5000,
    enabled: !!agentId,
  });

  const memories = data?.data || [];

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-violet-400" />
          <span className="text-xs font-semibold text-white">Memory on 0G</span>
        </div>
        <div className="zerog-badge">
          <Database className="w-2.5 h-2.5" />
          {memories.length} stored
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-white/5 rounded animate-pulse" />
          ))}
        </div>
      ) : memories.length === 0 ? (
        <div className="text-center py-4 text-slate-500 text-xs">
          No memories yet — generate knowledge to populate memory
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {memories.slice(0, 15).map((memory) => (
            <div
              key={memory.id}
              className="p-2.5 rounded-lg bg-white/3 border border-white/5 hover:border-white/10 transition-colors"
            >
              <div className="flex items-start gap-2">
                <span className="text-sm flex-shrink-0">
                  {MEMORY_TYPE_ICONS[memory.memoryType] || "💭"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {memory.content}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Clock className="w-2.5 h-2.5 text-slate-600 flex-shrink-0" />
                    <span className="text-[10px] text-slate-600">
                      {formatDistanceToNow(new Date(memory.createdAt), { addSuffix: true })}
                    </span>
                    {memory.storageId && (
                      <ZeroGStorageTag
                        storageId={memory.storageId}
                        txHash={memory.storageTxHash || undefined}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
