"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Database, CheckCircle, Sparkles, ChevronDown } from "lucide-react";
import { Agent, AssetType, ASSET_TYPE_CONFIG } from "@/types";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { useAppStore } from "@/store";
import { clsx } from "clsx";

interface GenerateAssetModalProps {
  agent: Agent;
  onClose: () => void;
  onGenerated: () => void;
}

const TOPIC_SUGGESTIONS: Record<AssetType, string[]> = {
  RESEARCH_REPORT: [
    "The future of autonomous AI agents in enterprise workflows",
    "Decentralized storage adoption trends 2024-2026",
    "AI-powered knowledge management systems",
  ],
  MARKET_ANALYSIS: [
    "Web3 infrastructure market Q3 2024",
    "AI developer tools market landscape",
    "Decentralized compute platforms competitive analysis",
  ],
  TECHNICAL_DOCS: [
    "0G Storage SDK integration patterns",
    "Multi-agent coordination architectures",
    "Blockchain-based identity systems for AI",
  ],
  STARTUP_INTEL: [
    "0G Labs — decentralized AI infrastructure",
    "Ritual — onchain AI network",
    "Bittensor — decentralized ML network",
  ],
  CODE_ARCHITECTURE: [
    "Autonomous agent marketplace platform",
    "Real-time collaborative AI workspace",
    "Decentralized knowledge graph system",
  ],
  COMPETITIVE_ANALYSIS: [
    "Decentralized storage: 0G vs Filecoin vs Arweave",
    "AI agent platforms competitive landscape",
    "Web3 data availability layer comparison",
  ],
};

interface ProgressStep {
  label: string;
  status: "pending" | "active" | "complete" | "error";
  ref?: string;
}

export function GenerateAssetModal({ agent, onGenerated, onClose }: GenerateAssetModalProps) {
  const [assetType, setAssetType] = useState<AssetType>("RESEARCH_REPORT");
  const [topic, setTopic] = useState("");
  const [price, setPrice] = useState(ASSET_TYPE_CONFIG[assetType].basePrice);
  const [isGenerating, setIsGenerating] = useState(false);
  const [steps, setSteps] = useState<ProgressStep[]>([]);
  const [result, setResult] = useState<{ title: string; storageId?: string; txHash?: string } | null>(null);
  const { addZeroGActivity } = useAppStore();

  useEffect(() => {
    setPrice(ASSET_TYPE_CONFIG[assetType].basePrice);
  }, [assetType]);

  const updateStep = (index: number, update: Partial<ProgressStep>) => {
    setSteps(prev => prev.map((s, i) => i === index ? { ...s, ...update } : s));
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Enter a topic for the knowledge asset");
      return;
    }

    setIsGenerating(true);
    setResult(null);

    const initialSteps: ProgressStep[] = [
      { label: "Agent analyzing topic...", status: "active" },
      { label: "Generating knowledge asset with AI", status: "pending" },
      { label: "Uploading to 0G Storage", status: "pending" },
      { label: "Recording ownership on 0G Chain", status: "pending" },
      { label: "Persisting reputation on 0G", status: "pending" },
      { label: "Storing memory on 0G Network", status: "pending" },
      { label: "Listing in marketplace", status: "pending" },
    ];
    setSteps(initialSteps);

    // Simulate progressive steps
    const stepTimings = [800, 500, 0, 0, 0, 0, 0];
    for (let i = 0; i < 2; i++) {
      await sleep(stepTimings[i]);
      updateStep(i, { status: "complete" });
      if (i + 1 < initialSteps.length) updateStep(i + 1, { status: "active" });
    }

    try {
      const res = await api.post<{ title: string }>("/api/assets", {
        agentId: agent.id,
        assetType,
        topic: topic.trim(),
        price,
      });

      if (res.success && res.data) {
        const zeroGData = res as { zeroG?: { storageId?: string; txHash?: string; ownershipTx?: string } };

        // Complete all steps
        setSteps([
          { label: "Topic analyzed", status: "complete" },
          { label: "Knowledge asset generated", status: "complete" },
          { label: "Uploaded to 0G Storage", status: "complete", ref: zeroGData.zeroG?.storageId },
          { label: "Ownership recorded on 0G Chain", status: "complete", ref: zeroGData.zeroG?.ownershipTx },
          { label: "Reputation persisted on 0G", status: "complete" },
          { label: "Memory stored on 0G Network", status: "complete" },
          { label: "Listed in marketplace", status: "complete" },
        ]);

        setResult({
          title: res.data.title,
          storageId: zeroGData.zeroG?.storageId,
          txHash: zeroGData.zeroG?.txHash,
        });

        addZeroGActivity({
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          type: "upload",
          description: `Knowledge asset stored: ${res.data.title}`,
          storageId: zeroGData.zeroG?.storageId,
          txHash: zeroGData.zeroG?.txHash,
        });

        toast.success("Knowledge asset created and stored on 0G!");
        setTimeout(onGenerated, 2000);
      } else {
        throw new Error(res.error || "Generation failed");
      }
    } catch (e) {
      updateStep(steps.findIndex(s => s.status === "active"), { status: "error" });
      toast.error(String(e));
      setIsGenerating(false);
    }
  };

  const assetConfig = ASSET_TYPE_CONFIG[assetType];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={!isGenerating ? onClose : undefined} />

      <div className="relative glass-card w-full max-w-xl p-6 border-forge-500/20 max-h-[90vh] overflow-y-auto">
        {!isGenerating && (
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🧠</span>
            <h2 className="text-xl font-bold text-white">Generate Knowledge Asset</h2>
          </div>
          <p className="text-sm text-slate-400">
            <span className="text-forge-300">{agent.name}</span> will create and store the asset on 0G
          </p>
        </div>

        {!isGenerating ? (
          <>
            {/* Asset Type */}
            <div className="mb-4">
              <label className="text-xs font-medium text-slate-400 block mb-2">Asset Type</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(ASSET_TYPE_CONFIG) as AssetType[]).map((type) => {
                  const cfg = ASSET_TYPE_CONFIG[type];
                  return (
                    <button
                      key={type}
                      onClick={() => setAssetType(type)}
                      className={clsx(
                        "p-2.5 rounded-lg text-left transition-all text-xs border",
                        assetType === type
                          ? "border-forge-500/50 bg-forge-600/15 text-white"
                          : "border-white/8 text-slate-400 hover:border-white/15 hover:text-slate-200"
                      )}
                    >
                      <span className="text-base mr-1">{cfg.icon}</span>
                      <span className="font-medium">{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Topic */}
            <div className="mb-4">
              <label className="text-xs font-medium text-slate-400 block mb-2">Topic / Subject</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={`What should ${agent.name} research?`}
                rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-forge-500/50 resize-none"
              />
              <div className="mt-1.5 flex flex-wrap gap-1">
                {TOPIC_SUGGESTIONS[assetType].slice(0, 2).map((s) => (
                  <button
                    key={s}
                    onClick={() => setTopic(s)}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-500 hover:text-slate-300 hover:bg-white/8 transition-colors border border-white/5"
                  >
                    {s.slice(0, 40)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="mb-5">
              <label className="text-xs font-medium text-slate-400 block mb-2">
                Listing Price (Ⓐ credits)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                min={0}
                step={5}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-forge-500/50"
              />
            </div>

            {/* 0G info */}
            <div className="mb-5 p-3 glass-card border border-cyan-500/15">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs text-cyan-400 font-semibold">0G Network Operations</span>
              </div>
              <div className="text-xs text-slate-400 space-y-0.5">
                <div>• Asset content uploaded to 0G Storage</div>
                <div>• Ownership record on 0G Chain</div>
                <div>• Memory & reputation persisted on 0G</div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={!topic.trim()}
              className={clsx(
                "w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2",
                !topic.trim()
                  ? "bg-white/5 text-slate-600 cursor-not-allowed"
                  : "bg-forge-600 hover:bg-forge-500 text-white glow-blue"
              )}
            >
              <Sparkles className="w-4 h-4" />
              Generate & Store on 0G
            </button>
          </>
        ) : (
          <div className="space-y-3">
            {/* Generation progress */}
            <div className="glass-card p-4 border border-forge-500/20">
              <div className="flex items-center gap-2 mb-4">
                <Database className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span className="text-sm font-semibold text-white">0G Knowledge Pipeline</span>
              </div>

              <div className="space-y-2">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs">
                    <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                      {step.status === "complete" && (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                      {step.status === "active" && (
                        <Loader2 className="w-3.5 h-3.5 text-forge-400 animate-spin" />
                      )}
                      {step.status === "pending" && (
                        <div className="w-2 h-2 rounded-full bg-white/15" />
                      )}
                      {step.status === "error" && (
                        <div className="w-3.5 h-3.5 rounded-full bg-red-500/30 border border-red-500 flex items-center justify-center">
                          <span className="text-[8px] text-red-400">!</span>
                        </div>
                      )}
                    </div>
                    <span className={clsx(
                      step.status === "complete" && "text-slate-300",
                      step.status === "active" && "text-white",
                      step.status === "pending" && "text-slate-600",
                      step.status === "error" && "text-red-400"
                    )}>
                      {step.label}
                    </span>
                    {step.ref && (
                      <span className="ml-auto text-slate-600 font-mono text-[10px]">
                        {step.ref.slice(0, 8)}...
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {result && (
              <div className="glass-card p-4 border border-emerald-500/25 bg-emerald-500/5">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-300">Asset Created!</span>
                </div>
                <p className="text-xs text-slate-300 mb-2 font-medium">"{result.title}"</p>
                {result.storageId && (
                  <div className="text-[10px] font-mono text-slate-500">
                    0G ID: {result.storageId.slice(0, 20)}...
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}
