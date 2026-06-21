"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Filter, TrendingUp, Database, ShoppingCart, Loader2 } from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";
import { AssetCard } from "@/components/marketplace/AssetCard";
import { AssetViewer } from "@/components/marketplace/AssetViewer";
import { ZeroGBadge } from "@/components/shared/ZeroGBadge";
import { api } from "@/lib/api";
import { KnowledgeAsset, AssetType, ASSET_TYPE_CONFIG, MarketplaceStats } from "@/types";
import { useAppStore } from "@/store";
import toast from "react-hot-toast";
import { clsx } from "clsx";

const SORT_OPTIONS = [
  { value: "recent", label: "Most Recent" },
  { value: "quality", label: "Highest Quality" },
  { value: "popular", label: "Most Popular" },
  { value: "price", label: "Highest Price" },
];

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [assetType, setAssetType] = useState<AssetType | "ALL">("ALL");
  const [sortBy, setSortBy] = useState("recent");
  const [viewingAsset, setViewingAsset] = useState<KnowledgeAsset | null>(null);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const { activeAgent, addZeroGActivity } = useAppStore();
  const queryClient = useQueryClient();

  const params = new URLSearchParams({
    ...(assetType !== "ALL" && { assetType }),
    ...(search && { search }),
    sortBy,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["marketplace", assetType, search, sortBy],
    queryFn: () => api.get<KnowledgeAsset[]>(`/api/marketplace?${params}`),
    refetchInterval: 8000,
  });

  const assets = data?.data || [];
  const stats = (data as { stats?: MarketplaceStats })?.stats;

  // IDs owned by active agent
  const ownedIds = new Set(
    activeAgent?.ownedAssets?.map((oa) => oa.assetId) || []
  );

  const handlePurchase = async (asset: KnowledgeAsset) => {
    if (!activeAgent) {
      toast.error("Select an active agent first");
      return;
    }
    if (asset.creatorId === activeAgent.id) {
      toast.error("You created this asset");
      return;
    }

    setPurchasing(asset.id);
    try {
      const res = await api.post("/api/marketplace", {
        buyerAgentId: activeAgent.id,
        assetId: asset.id,
      });

      if (res.success) {
        const zeroG = (res as { zeroG?: { ownershipStorageId?: string; ownershipTxHash?: string } }).zeroG;
        addZeroGActivity({
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          type: "ownership",
          description: `Ownership recorded: ${asset.title}`,
          storageId: zeroG?.ownershipStorageId,
          txHash: zeroG?.ownershipTxHash,
        });

        toast.success(`"${asset.title}" acquired! Ownership on 0G Chain.`);
        queryClient.invalidateQueries({ queryKey: ["marketplace"] });
        queryClient.invalidateQueries({ queryKey: ["agents"] });
        setViewingAsset(null);
      } else {
        toast.error(res.error || "Purchase failed");
      }
    } catch (e) {
      toast.error("Purchase failed");
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a18]">
      <div className="grid-bg fixed inset-0 pointer-events-none opacity-30" />
      <Navbar />

      <div className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Knowledge Marketplace</h1>
            <p className="text-slate-400 mt-1 text-sm">
              AI-generated assets stored and owned on 0G Network
            </p>
          </div>
          <ZeroGBadge showDot />
        </div>

        {/* Stats bar */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Listed Assets", value: stats.totalAssets, icon: "📦" },
              { label: "Active Agents", value: stats.totalAgents, icon: "🤖" },
              { label: "Trade Volume", value: `${stats.totalVolume.toFixed(0)}Ⓐ`, icon: "💰" },
              { label: "Memories on 0G", value: stats.totalMemories, icon: "🧠" },
            ].map((s, i) => (
              <div key={i} className="stat-card flex items-center gap-3">
                <span className="text-xl">{s.icon}</span>
                <div>
                  <div className="text-lg font-bold text-white">{s.value}</div>
                  <div className="text-[10px] text-slate-500">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search assets..."
              className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-600 text-sm focus:outline-none focus:border-forge-500/50"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-slate-300 text-sm focus:outline-none appearance-none"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-slate-900">
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Type filter pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setAssetType("ALL")}
            className={clsx(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              assetType === "ALL"
                ? "bg-forge-600 text-white"
                : "glass-card text-slate-400 hover:text-white"
            )}
          >
            All Types
          </button>
          {(Object.keys(ASSET_TYPE_CONFIG) as AssetType[]).map((type) => (
            <button
              key={type}
              onClick={() => setAssetType(type)}
              className={clsx(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1",
                assetType === type
                  ? "bg-forge-600 text-white"
                  : "glass-card text-slate-400 hover:text-white"
              )}
            >
              {ASSET_TYPE_CONFIG[type].icon} {ASSET_TYPE_CONFIG[type].label}
            </button>
          ))}
        </div>

        {/* Active agent notice */}
        {!activeAgent && (
          <div className="glass-card p-4 border border-amber-500/20 bg-amber-500/5 mb-6 flex items-center gap-3">
            <ShoppingCart className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <p className="text-sm text-amber-200">
              Go to <strong>Agents</strong> and select an active agent to purchase assets
            </p>
          </div>
        )}

        {/* Asset Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card p-5 animate-pulse h-64">
                <div className="h-4 bg-white/10 rounded mb-3 w-3/4" />
                <div className="h-3 bg-white/5 rounded mb-2 w-full" />
                <div className="h-3 bg-white/5 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : assets.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <Database className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">No assets found</h3>
            <p className="text-slate-400 text-sm">
              {search ? "Try a different search" : "Agents haven't created any assets yet"}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assets.map((asset) => (
              <div key={asset.id} className="relative">
                {purchasing === asset.id && (
                  <div className="absolute inset-0 z-10 bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-forge-400 animate-spin" />
                  </div>
                )}
                <AssetCard
                  asset={asset}
                  onPurchase={activeAgent && asset.creatorId !== activeAgent.id ? () => handlePurchase(asset) : undefined}
                  onView={() => setViewingAsset(asset)}
                  ownedByActive={ownedIds.has(asset.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {viewingAsset && (
        <AssetViewer
          asset={viewingAsset}
          onClose={() => setViewingAsset(null)}
          onPurchase={
            activeAgent && viewingAsset.creatorId !== activeAgent.id && !ownedIds.has(viewingAsset.id)
              ? () => handlePurchase(viewingAsset)
              : undefined
          }
          ownedByActive={ownedIds.has(viewingAsset.id)}
        />
      )}
    </div>
  );
}
