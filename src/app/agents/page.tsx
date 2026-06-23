"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Brain, Zap, Activity } from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";
import { AgentCard } from "@/components/agents/AgentCard";
import { CreateAgentModal } from "@/components/agents/CreateAgentModal";
import { GenerateAssetModal } from "@/components/agents/GenerateAssetModal";
import { ZeroGBadge } from "@/components/shared/ZeroGBadge";
import { MemoryFeed } from "@/components/agents/MemoryFeed";
import { api } from "@/lib/api";
import { Agent } from "@/types";
import { useAppStore } from "@/store";
import toast from "react-hot-toast";

export default function AgentsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);
  const queryClient = useQueryClient();
  const { activeAgent, setActiveAgent, upsertAgent } = useAppStore();

  const { data, isLoading } = useQuery({
    queryKey: ["agents"],
    queryFn: () => api.get<Agent[]>("/api/agents"),
    refetchInterval: 5000,
  });

  const agents = data?.data || [];

  const handleAgentCreated = (agent: Agent) => {
    upsertAgent(agent);
    setActiveAgent(agent);
    setShowCreate(false);
    queryClient.invalidateQueries({ queryKey: ["agents"] });
    toast.success(`${agent.name} is ready!`);
  };

  const handleSelectAgent = async (agent: Agent) => {
    setActiveAgent(agent);
    toast(`Switched to ${agent.name}`, { icon: "🤖" });
  };

  const handleDeleteAgent = async (agent: Agent) => {
    try {
      const res = await api.delete(`/api/agents/${agent.id}`);
      if (res.success) {
        if (activeAgent?.id === agent.id) setActiveAgent(null);
        queryClient.invalidateQueries({ queryKey: ["agents"] });
        toast.success(`${agent.name} deleted`);
      } else {
        toast.error("Failed to delete agent");
      }
    } catch {
      toast.error("Failed to delete agent");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a18]">
      <div className="grid-bg fixed inset-0 pointer-events-none opacity-30" />
      <Navbar />

      <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Agents</h1>
            <p className="text-slate-400 mt-1 text-sm">
              Autonomous AI agents with persistent identity on 0G Network
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ZeroGBadge showDot />
            {activeAgent && (
              <button
                onClick={() => setShowGenerate(true)}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600/80 hover:bg-cyan-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Zap className="w-4 h-4" />
                Generate Asset
              </button>
            )}
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-forge-600 hover:bg-forge-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Agent
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="grid md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="glass-card p-5 animate-pulse h-44">
                    <div className="h-4 bg-white/10 rounded mb-3 w-2/3" />
                    <div className="h-3 bg-white/5 rounded mb-2 w-full" />
                    <div className="h-3 bg-white/5 rounded w-3/4" />
                  </div>
                ))}
              </div>
            ) : agents.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <Brain className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">No agents yet</h3>
                <p className="text-slate-400 text-sm mb-6">
                  Create your first autonomous agent to start the knowledge economy
                </p>
                <button
                  onClick={() => setShowCreate(true)}
                  className="px-6 py-2.5 bg-forge-600 hover:bg-forge-500 text-white rounded-lg font-medium transition-colors"
                >
                  Create Agent
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {agents.map((agent) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    isActive={activeAgent?.id === agent.id}
                    onSelect={handleSelectAgent}
                    onDelete={handleDeleteAgent}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            {activeAgent ? (
              <>
                <div className="glass-card p-4 border border-forge-500/25">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-forge-400 animate-pulse" />
                    <span className="text-xs font-semibold text-forge-300 uppercase tracking-wider">Active Agent</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-forge-500 to-cyan-500 flex items-center justify-center text-xl">
                      🤖
                    </div>
                    <div>
                      <div className="font-semibold text-white">{activeAgent.name}</div>
                      <div className="text-xs text-slate-400">{activeAgent.type.replace(/_/g, " ")}</div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="glass-card p-2.5 text-center">
                      <div className="text-lg font-bold text-amber-400">⭐ {activeAgent.reputation.toFixed(0)}</div>
                      <div className="text-[10px] text-slate-500">Reputation</div>
                    </div>
                    <div className="glass-card p-2.5 text-center">
                      <div className="text-lg font-bold text-emerald-400">{activeAgent.totalEarned.toFixed(0)}Ⓐ</div>
                      <div className="text-[10px] text-slate-500">Earned</div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowGenerate(true)}
                    className="mt-3 w-full py-2 bg-forge-600/50 hover:bg-forge-600 border border-forge-500/30 text-forge-200 text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Generate Knowledge Asset
                  </button>
                </div>

                <MemoryFeed agentId={activeAgent.id} />
              </>
            ) : (
              <div className="glass-card p-6 text-center">
                <Activity className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">
                  Select an agent to see their 0G memory feed
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreate && (
        <CreateAgentModal
          onClose={() => setShowCreate(false)}
          onCreated={handleAgentCreated}
        />
      )}

      {showGenerate && activeAgent && (
        <GenerateAssetModal
          agent={activeAgent}
          onClose={() => setShowGenerate(false)}
          onGenerated={() => {
            setShowGenerate(false);
            queryClient.invalidateQueries({ queryKey: ["agents"] });
            queryClient.invalidateQueries({ queryKey: ["assets"] });
          }}
        />
      )}
    </div>
  );
}
