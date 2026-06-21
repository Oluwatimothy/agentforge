"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Brain, Zap, Database, CheckCircle, Circle, ArrowRight,
  Package, Star, Activity, Clock, Loader2, ChevronDown, Send
} from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";
import { ZeroGBadge, ZeroGStorageTag, ZeroGStatusBar } from "@/components/shared/ZeroGBadge";
import { ReputationBadge } from "@/components/shared/ReputationBadge";
import { api } from "@/lib/api";
import { Agent, KnowledgeAsset, AssetType, ASSET_TYPE_CONFIG, AGENT_TYPE_CONFIG } from "@/types";
import { useAppStore } from "@/store";
import toast from "react-hot-toast";
import { clsx } from "clsx";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface ThoughtLine {
  id: string;
  text: string;
  type: "thinking" | "action" | "result" | "zerog";
  timestamp: Date;
  ref?: string;
}

const TYPE_ICONS: Record<string, string> = {
  RESEARCH: "🔬", CODING: "💻", MARKET_ANALYST: "📊", STRATEGIST: "♟️",
};

export default function WorkspacePage() {
  const { activeAgent, setActiveAgent, addZeroGActivity } = useAppStore();
  const [topic, setTopic] = useState("");
  const [assetType, setAssetType] = useState<AssetType>("MARKET_ANALYSIS");
  const [price, setPrice] = useState(25);
  const [isRunning, setIsRunning] = useState(false);
  const [thoughts, setThoughts] = useState<ThoughtLine[]>([]);
  const [lastAsset, setLastAsset] = useState<KnowledgeAsset | null>(null);
  const [ops, setOps] = useState<Array<{ label: string; status: "pending" | "complete" | "error"; ref?: string }>>([]);
  const thoughtsRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: agentsData } = useQuery({
    queryKey: ["agents"],
    queryFn: () => api.get<Agent[]>("/api/agents"),
    refetchInterval: 5000,
  });
  const agents = agentsData?.data || [];

  useEffect(() => {
    if (thoughtsRef.current) {
      thoughtsRef.current.scrollTop = thoughtsRef.current.scrollHeight;
    }
  }, [thoughts]);

  const addThought = (text: string, type: ThoughtLine["type"], ref?: string) => {
    setThoughts(prev => [...prev, {
      id: Date.now().toString() + Math.random(),
      text, type, timestamp: new Date(), ref
    }]);
  };

  const handleRun = async () => {
    if (!activeAgent) { toast.error("Select an agent first"); return; }
    if (!topic.trim()) { toast.error("Enter a topic"); return; }

    setIsRunning(true);
    setThoughts([]);
    setLastAsset(null);
    setOps([
      { label: "Analyzing topic", status: "pending" },
      { label: "Generating with AI", status: "pending" },
      { label: "Uploading to 0G Storage", status: "pending" },
      { label: "Recording ownership on 0G Chain", status: "pending" },
      { label: "Persisting reputation on 0G", status: "pending" },
      { label: "Writing memory to 0G", status: "pending" },
    ]);

    const typeConfig = AGENT_TYPE_CONFIG[activeAgent.type];

    // Simulate agent thinking
    await sleep(300);
    addThought(`Initializing ${activeAgent.name}...`, "thinking");
    setOps(p => p.map((o, i) => i === 0 ? { ...o, status: "complete" } : o));

    await sleep(400);
    addThought(`Task received: Generate a ${ASSET_TYPE_CONFIG[assetType].label} about "${topic}"`, "action");

    await sleep(500);
    addThought(`Searching knowledge base... checking 0G memory root hash...`, "thinking");

    await sleep(400);
    addThought(`Memory retrieved from 0G Network. Previous context loaded.`, "zerog",
      activeAgent.memoryRootHash || undefined);

    await sleep(300);
    addThought(`Drafting ${ASSET_TYPE_CONFIG[assetType].label} with ${typeConfig?.capabilities?.join(", ")} capabilities...`, "thinking");
    setOps(p => p.map((o, i) => i === 1 ? { ...o, status: "pending" } : o));

    try {
      const res = await api.post<KnowledgeAsset>("/api/assets", {
        agentId: activeAgent.id,
        assetType,
        topic: topic.trim(),
        price,
      });

      if (!res.success || !res.data) throw new Error(res.error || "Failed");

      const zeroG = (res as { zeroG?: { storageId?: string; txHash?: string; rootHash?: string; ownershipTx?: string; size?: number } }).zeroG;
      const rep = (res as { reputation?: { gained: number; new: number } }).reputation;

      // Complete ops sequentially
      setOps(p => p.map((o, i) => i <= 1 ? { ...o, status: "complete" } : o));
      await sleep(200);

      addThought(`Knowledge asset generated. ${res.data.content.split(" ").length} words. Quality: ${res.data.qualityScore}/100`, "result");
      await sleep(300);

      setOps(p => p.map((o, i) => i === 2 ? { ...o, status: "complete", ref: zeroG?.storageId } : o));
      addThought(`Uploading to 0G Storage Network...`, "action");
      await sleep(200);
      addThought(`✓ Stored on 0G Storage`, "zerog", zeroG?.storageId);
      await sleep(200);

      setOps(p => p.map((o, i) => i === 3 ? { ...o, status: "complete", ref: zeroG?.ownershipTx } : o));
      addThought(`Recording ownership on 0G Chain...`, "action");
      await sleep(200);
      addThought(`✓ Ownership registered on 0G Chain`, "zerog", zeroG?.ownershipTx);
      await sleep(200);

      setOps(p => p.map((o, i) => i === 4 ? { ...o, status: "complete" } : o));
      addThought(`Reputation update: +${rep?.gained || 5} points → ${rep?.new?.toFixed(1) || "?"} total`, "result");
      await sleep(200);

      setOps(p => p.map((o, i) => i === 5 ? { ...o, status: "complete" } : o));
      addThought(`Writing task memory to 0G Network...`, "action");
      await sleep(200);
      addThought(`✓ Memory persisted on 0G`, "zerog");

      setLastAsset(res.data);

      addZeroGActivity({
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        type: "upload",
        description: `Asset created: "${res.data.title}"`,
        storageId: zeroG?.storageId,
        txHash: zeroG?.txHash,
        size: zeroG?.size,
      });

      queryClient.invalidateQueries({ queryKey: ["agents"] });
      queryClient.invalidateQueries({ queryKey: ["assets"] });

      // Refresh active agent
      const updated = await api.get<Agent>(`/api/agents/${activeAgent.id}`);
      if (updated.data) setActiveAgent(updated.data);

      toast.success(`Asset stored on 0G Network!`);
    } catch (e) {
      addThought(`Error: ${String(e)}`, "action");
      setOps(p => p.map(o => o.status === "pending" ? { ...o, status: "error" } : o));
      toast.error(String(e));
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a18]">
      <div className="grid-bg fixed inset-0 pointer-events-none opacity-30" />
      <Navbar />

      <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Agent Workspace</h1>
            <p className="text-slate-400 mt-1 text-sm">Live agent operations with 0G pipeline visualization</p>
          </div>
          <ZeroGBadge showDot />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Controls */}
          <div className="space-y-4">
            {/* Agent selector */}
            <div className="glass-card p-4">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
                Active Agent
              </label>
              {agents.length === 0 ? (
                <Link href="/agents" className="block text-center py-3 text-sm text-forge-400 hover:text-forge-300 transition-colors">
                  + Create an agent first
                </Link>
              ) : (
                <div className="space-y-2">
                  {agents.slice(0, 6).map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => setActiveAgent(agent)}
                      className={clsx(
                        "w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all",
                        activeAgent?.id === agent.id
                          ? "bg-forge-600/20 border border-forge-500/40"
                          : "hover:bg-white/5 border border-transparent"
                      )}
                    >
                      <div className={clsx(
                        "w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0",
                        `bg-gradient-to-br ${AGENT_TYPE_CONFIG[agent.type]?.color || "from-forge-500 to-cyan-500"}`
                      )}>
                        {TYPE_ICONS[agent.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{agent.name}</div>
                        <div className="text-[10px] text-slate-500">⭐ {agent.reputation.toFixed(0)} rep</div>
                      </div>
                      {activeAgent?.id === agent.id && (
                        <div className="w-1.5 h-1.5 rounded-full bg-forge-400 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Task config */}
            <div className="glass-card p-4 space-y-4">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Task Configuration
              </label>

              <div>
                <label className="text-xs text-slate-500 block mb-1.5">Asset Type</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(Object.keys(ASSET_TYPE_CONFIG) as AssetType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setAssetType(type)}
                      className={clsx(
                        "p-2 rounded-lg text-left transition-all border text-xs",
                        assetType === type
                          ? "border-forge-500/50 bg-forge-600/15 text-white"
                          : "border-white/8 text-slate-500 hover:text-slate-300 hover:border-white/15"
                      )}
                    >
                      {ASSET_TYPE_CONFIG[type].icon} {ASSET_TYPE_CONFIG[type].label.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 block mb-1.5">Topic</label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="What should the agent research?"
                  rows={3}
                  disabled={isRunning}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-forge-500/50 resize-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 block mb-1.5">List Price (Ⓐ)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  min={0}
                  step={5}
                  disabled={isRunning}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-forge-500/50"
                />
              </div>

              <button
                onClick={handleRun}
                disabled={isRunning || !activeAgent || !topic.trim()}
                className={clsx(
                  "w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all",
                  isRunning || !activeAgent || !topic.trim()
                    ? "bg-white/5 text-slate-600 cursor-not-allowed"
                    : "bg-forge-600 hover:bg-forge-500 text-white glow-blue"
                )}
              >
                {isRunning ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Agent Running...</>
                ) : (
                  <><Zap className="w-4 h-4" /> Run Agent Task</>
                )}
              </button>
            </div>

            {/* 0G ops tracker */}
            {ops.length > 0 && (
              <ZeroGStatusBar operations={ops} />
            )}
          </div>

          {/* Center: Agent thought stream */}
          <div className="glass-card p-4 flex flex-col" style={{ minHeight: 500 }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-violet-400" />
                <span className="text-xs font-semibold text-white">Agent Thought Stream</span>
              </div>
              {isRunning && (
                <div className="flex items-center gap-1.5 text-xs text-forge-400">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Processing...</span>
                </div>
              )}
            </div>

            <div
              ref={thoughtsRef}
              className="flex-1 overflow-y-auto space-y-2 font-mono"
            >
              {thoughts.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-600 text-xs text-center">
                  <div>
                    <Brain className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>Configure a task and click "Run Agent Task"</p>
                    <p className="mt-1">Watch the agent think and interact with 0G live</p>
                  </div>
                </div>
              ) : (
                thoughts.map((t) => (
                  <div
                    key={t.id}
                    className={clsx(
                      "flex gap-2 text-xs leading-relaxed",
                      t.type === "thinking" && "text-slate-400",
                      t.type === "action" && "text-forge-300",
                      t.type === "result" && "text-emerald-300",
                      t.type === "zerog" && "text-cyan-300"
                    )}
                  >
                    <span className="flex-shrink-0 text-slate-600 tabular-nums">
                      {t.timestamp.toLocaleTimeString("en", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </span>
                    <span className="flex-shrink-0">
                      {t.type === "thinking" ? "💭" : t.type === "action" ? "⚡" : t.type === "result" ? "✅" : "🌐"}
                    </span>
                    <span className="flex-1">
                      {t.text}
                      {t.ref && (
                        <span className="ml-1 text-slate-600 text-[10px]">
                          [{t.ref.slice(0, 12)}...]
                        </span>
                      )}
                    </span>
                  </div>
                ))
              )}
              {isRunning && (
                <div className="flex gap-2 text-xs text-slate-500">
                  <span className="flex-shrink-0">
                    {new Date().toLocaleTimeString("en", { hour12: false })}
                  </span>
                  <span className="cursor-blink">▊</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Result + Agent stats */}
          <div className="space-y-4">
            {/* Active agent card */}
            {activeAgent && (
              <div className="glass-card p-4 border border-forge-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className={clsx(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-xl",
                    `bg-gradient-to-br ${AGENT_TYPE_CONFIG[activeAgent.type]?.color}`
                  )}>
                    {TYPE_ICONS[activeAgent.type]}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{activeAgent.name}</div>
                    <ReputationBadge score={activeAgent.reputation} showLabel />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="glass-card p-2">
                    <div className="text-sm font-bold text-white">{activeAgent._count?.createdAssets || 0}</div>
                    <div className="text-[10px] text-slate-500">Assets</div>
                  </div>
                  <div className="glass-card p-2">
                    <div className="text-sm font-bold text-emerald-400">{activeAgent.totalEarned.toFixed(0)}Ⓐ</div>
                    <div className="text-[10px] text-slate-500">Earned</div>
                  </div>
                  <div className="glass-card p-2">
                    <div className="text-sm font-bold text-cyan-400">{activeAgent._count?.memories || 0}</div>
                    <div className="text-[10px] text-slate-500">Memories</div>
                  </div>
                </div>
                {activeAgent.memoryRootHash && (
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <div className="text-[10px] text-slate-600 mb-1">0G Memory Root</div>
                    <ZeroGStorageTag rootHash={activeAgent.memoryRootHash} />
                  </div>
                )}
              </div>
            )}

            {/* Last generated asset */}
            {lastAsset && (
              <div className="glass-card p-4 border border-emerald-500/25 bg-emerald-500/3">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-300">Asset Created & Stored</span>
                </div>
                <p className="text-sm font-medium text-white mb-2 leading-snug">
                  {lastAsset.title}
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div>
                    <span className="text-slate-500">Quality</span>
                    <div className="font-semibold text-white">{lastAsset.qualityScore}/100</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Price</span>
                    <div className="font-semibold text-white">{lastAsset.price}Ⓐ</div>
                  </div>
                </div>
                <div className="space-y-1">
                  {lastAsset.storageId && (
                    <div className="flex items-center gap-2 text-[10px]">
                      <Database className="w-2.5 h-2.5 text-cyan-400" />
                      <span className="text-slate-500">0G Storage:</span>
                      <ZeroGStorageTag storageId={lastAsset.storageId} />
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  <Link
                    href="/marketplace"
                    className="flex-1 py-2 rounded-lg text-center text-xs bg-forge-600/50 hover:bg-forge-600 text-forge-200 transition-colors"
                  >
                    View in Marketplace
                  </Link>
                </div>
              </div>
            )}

            {/* Economy info box */}
            <div className="glass-card p-4 border border-cyan-500/15">
              <div className="flex items-center gap-2 mb-3">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-semibold text-cyan-400">0G Economy Layer</span>
              </div>
              <div className="space-y-2 text-xs text-slate-400">
                {[
                  "Agent memory → 0G Storage",
                  "Asset content → 0G Storage",
                  "Ownership proof → 0G Chain",
                  "Reputation record → 0G Storage",
                  "Transaction history → 0G Chain",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <ArrowRight className="w-2.5 h-2.5 text-cyan-600 flex-shrink-0" />
                    {item}
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

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}
