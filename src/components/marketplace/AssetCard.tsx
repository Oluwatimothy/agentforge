"use client";

import { Star, Eye, Download, ShoppingCart, ExternalLink, Database } from "lucide-react";
import { KnowledgeAsset, ASSET_TYPE_CONFIG, AGENT_TYPE_CONFIG } from "@/types";
import { ZeroGStorageTag } from "@/components/shared/ZeroGBadge";
import { formatDistanceToNow } from "date-fns";
import { clsx } from "clsx";

interface AssetCardProps {
  asset: KnowledgeAsset;
  onPurchase?: (asset: KnowledgeAsset) => void;
  onView?: (asset: KnowledgeAsset) => void;
  ownedByActive?: boolean;
  compact?: boolean;
}

export function AssetCard({ asset, onPurchase, onView, ownedByActive, compact }: AssetCardProps) {
  const typeConfig = ASSET_TYPE_CONFIG[asset.assetType];
  const creatorTypeConfig = asset.creator ? AGENT_TYPE_CONFIG[asset.creator.type] : null;

  return (
    <div
      className={clsx(
        "glass-card-hover p-5 relative overflow-hidden",
        ownedByActive && "border-emerald-500/25 bg-emerald-500/3"
      )}
    >
      {ownedByActive && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
      )}

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="text-2xl flex-shrink-0">{typeConfig?.icon || "📄"}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-sm line-clamp-2 leading-snug mb-1">
            {asset.title}
          </h3>
          {asset.storageId && (
            <ZeroGStorageTag
              storageId={asset.storageId}
              txHash={asset.storageTxHash || undefined}
            />
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-lg font-bold text-white">{asset.price}<span className="text-xs text-slate-400 ml-0.5">Ⓐ</span></div>
        </div>
      </div>

      {!compact && (
        <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
          {asset.description}
        </p>
      )}

      {/* Quality bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-slate-500">Quality Score</span>
          <span className="text-[10px] font-semibold text-white">{asset.qualityScore}/100</span>
        </div>
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <div
            className={clsx(
              "h-full rounded-full transition-all",
              asset.qualityScore >= 80 ? "bg-emerald-500" :
              asset.qualityScore >= 60 ? "bg-amber-500" : "bg-slate-500"
            )}
            style={{ width: `${asset.qualityScore}%` }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3 mb-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Eye className="w-3 h-3" />
          {asset.viewCount}
        </span>
        <span className="flex items-center gap-1">
          <Download className="w-3 h-3" />
          {asset.downloadCount}
        </span>
        {asset.creator && (
          <span className="ml-auto flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400" />
            <span className="text-slate-400">{asset.creator.name}</span>
          </span>
        )}
      </div>

      {/* Tags */}
      {asset.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {asset.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 rounded text-[10px] bg-white/5 text-slate-500 border border-white/5"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {onView && (
          <button
            onClick={() => onView(asset)}
            className="flex-1 py-2 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:border-white/20 text-xs font-medium transition-colors flex items-center justify-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            Preview
          </button>
        )}
        {ownedByActive ? (
          <div className="flex-1 py-2 rounded-lg border border-emerald-500/30 text-emerald-400 text-xs font-medium text-center bg-emerald-500/5">
            ✓ Owned
          </div>
        ) : onPurchase ? (
          <button
            onClick={() => onPurchase(asset)}
            className="flex-1 py-2 rounded-lg bg-forge-600 hover:bg-forge-500 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1"
          >
            <ShoppingCart className="w-3 h-3" />
            Acquire {asset.price}Ⓐ
          </button>
        ) : null}
      </div>
    </div>
  );
}
