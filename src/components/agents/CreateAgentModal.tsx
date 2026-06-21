"use client";

import { useState } from "react";
import { X, Brain, Code, TrendingUp, Sparkles, Loader2, Database } from "lucide-react";
import { AgentType, AGENT_TYPE_CONFIG } from "@/types";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { useAppStore } from "@/store";
import { Agent } from "@/types";
import { clsx } from "clsx";
import { ZeroGStatusBar } from "@/components/shared/ZeroGBadge";

interface CreateAgentModalProps {
  onClose: () => void;
  onCreated: (agent: Agent) => void;
}

const AGENT_TYPES: { type: AgentType; icon: string; desc: string }[] = [
  { type: "RESEARCH", icon: "🔬", desc: "Research reports & trend analysis" },
  { type: "CODING", icon: "💻", desc: "Tech docs & code architecture" },
  { type: "MARKET_ANALYST", icon: "📊", desc: "Market analysis & startup intel" },
  { type: "STRATEGIST", icon: "♟️", desc: "Strategy plans & opportunity maps" },
];

const SAMPLE_NAMES: Record<AgentType, string[]> = {
  RESEARCH: ["Atlas", "Nova", "Sage", "Orion", "Lyra"],
  CODING: ["Nexus", "Cipher", "Byte", "Vector", "Axiom"],
  MARKET_ANALYST: ["Sigma", "Pulse", "Quant", "Delta", "Helix"],
  STRATEGIST: ["Apex", "Vantage", "Zenith", "Stratos", "Pinnacle"],
};

export function CreateAgentModal({ onClose, onCreated }: CreateAgentModalProps) {
  const [selectedType, setSelectedType] = useState<AgentType>("RESEARCH");
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [ops, setOps] = useState<Array<{ label: string; status: "pending" | "complete" | "error"; ref?: string }>>([]);
  const { addZeroGActivity } = useAppStore();

  const suggestName = () => {
    const names = SAMPLE_NAMES[selectedType];
    setName(names[Math.floor(Math.random() * names.length)] + "-" + Math.floor(Math.random() * 99));
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Give your agent a name");
      return;
    }

    setIsCreating(true);
    setOps([
      { label: "Generating agent profile...", status: "pending" },
      { label: "Uploading profile to 0G Storage", status: "pending" },
      { label: "Registering on 0G Chain", status: "pending" },
      { label: "Initializing memory on 0G", status: "pending" },
    ]);

    // Simulate progressive ops
    setTimeout(() => setOps(p => p.map((o, i) => i === 0 ? { ...o, status: "complete" } : o)), 600);
    setTimeout(() => setOps(p => p.map((o, i) => i === 1 ? { ...o, status: "pending" } : o)), 700);

    try {
      const res = await api.post<Agent>("/api/agents", {
        name: name.trim(),
        type: selectedType,
      });

      if (res.success && res.data) {
        setOps([
          { label: "Agent profile generated", status: "complete" },
          { label: "Profile stored on 0G", status: "complete", ref: (res as { zeroG?: { storageId?: string } }).zeroG?.storageId },
          { label: "Registered on 0G Chain", status: "complete", ref: (res as { zeroG?: { txHash?: string } }).zeroG?.txHash },
          { label: "Memory initialized on 0G", status: "complete" },
        ]);

        addZeroGActivity({
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          type: "upload",
          description: `Agent ${name} profile uploaded`,
          storageId: (res as { zeroG?: { storageId?: string } }).zeroG?.storageId,
          txHash: (res as { zeroG?: { txHash?: string } }).zeroG?.txHash,
        });

        await new Promise(r => setTimeout(r, 800));
        toast.success(`${name} is live on 0G Network!`);
        onCreated(res.data);
      } else {
        throw new Error(res.error || "Creation failed");
      }
    } catch (e) {
      setOps(p => p.map(o => o.status === "pending" ? { ...o, status: "error" } : o));
      toast.error(String(e));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative glass-card w-full max-w-lg p-6 border-forge-500/20">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">Create Agent</h2>
          <p className="text-sm text-slate-400 mt-1">
            Agent identity and memory will be stored on 0G Network
          </p>
        </div>

        {/* Agent Type Selection */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          {AGENT_TYPES.map(({ type, icon, desc }) => {
            const config = AGENT_TYPE_CONFIG[type];
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={clsx(
                  "p-3 rounded-xl text-left transition-all duration-200 border",
                  selectedType === type
                    ? "border-forge-500/50 bg-forge-600/15 text-white"
                    : "border-white/8 bg-white/2 text-slate-400 hover:border-white/15 hover:text-slate-200"
                )}
              >
                <div className="text-xl mb-1">{icon}</div>
                <div className="text-xs font-semibold">{config.label}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{desc}</div>
              </button>
            );
          })}
        </div>

        {/* Name Input */}
        <div className="mb-5">
          <label className="text-xs font-medium text-slate-400 mb-1.5 block">Agent Name</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a name..."
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-forge-500/50"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              disabled={isCreating}
            />
            <button
              onClick={suggestName}
              disabled={isCreating}
              className="px-3 py-2.5 glass-card rounded-lg text-xs text-slate-400 hover:text-white transition-colors border border-white/8"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 0G Ops (shown during creation) */}
        {isCreating && ops.length > 0 && (
          <div className="mb-5">
            <ZeroGStatusBar operations={ops} />
          </div>
        )}

        {!isCreating && (
          <div className="mb-5 glass-card p-3 border border-cyan-500/15">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs text-cyan-400 font-semibold">What gets stored on 0G</span>
            </div>
            <ul className="space-y-1">
              {["Agent profile & identity", "Initial memory state", "Reputation seed", "Wallet registration"].map((item) => (
                <li key={item} className="text-xs text-slate-400 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-cyan-500/60 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={handleCreate}
          disabled={isCreating || !name.trim()}
          className={clsx(
            "w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2",
            isCreating || !name.trim()
              ? "bg-white/5 text-slate-600 cursor-not-allowed"
              : "bg-forge-600 hover:bg-forge-500 text-white glow-blue"
          )}
        >
          {isCreating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Deploying to 0G Network...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4" />
              Create & Deploy Agent
            </>
          )}
        </button>
      </div>
    </div>
  );
}
