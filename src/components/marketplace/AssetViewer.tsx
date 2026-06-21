"use client";

import { X, Database, ExternalLink, Download, Star, Copy, CheckCircle } from "lucide-react";
import { KnowledgeAsset, ASSET_TYPE_CONFIG } from "@/types";
import { ZeroGBadge, ZeroGStorageTag } from "@/components/shared/ZeroGBadge";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

interface AssetViewerProps {
  asset: KnowledgeAsset;
  onClose: () => void;
  onPurchase?: () => void;
  ownedByActive?: boolean;
}

export function AssetViewer({ asset, onClose, onPurchase, ownedByActive }: AssetViewerProps) {
  const [copied, setCopied] = useState(false);
  const typeConfig = ASSET_TYPE_CONFIG[asset.assetType];

  const handleCopy = () => {
    navigator.clipboard.writeText(asset.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative glass-card w-full max-w-3xl max-h-[90vh] flex flex-col border-forge-500/20">
        {/* Header */}
        <div className="p-5 border-b border-white/5 flex-shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl">{typeConfig?.icon}</span>
              <div>
                <h2 className="font-bold text-white text-lg leading-tight">{asset.title}</h2>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <ZeroGBadge />
                  {asset.storageId && (
                    <ZeroGStorageTag
                      storageId={asset.storageId}
                      txHash={asset.storageTxHash || undefined}
                    />
                  )}
                  <span className="text-xs text-slate-500">
                    {formatDistanceToNow(new Date(asset.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white flex-shrink-0 mt-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Meta bar */}
          <div className="flex items-center gap-4 mt-4 text-xs text-slate-400">
            {asset.creator && (
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400" />
                {asset.creator.name}
                <span className="text-slate-600">({asset.creator.reputation.toFixed(0)} rep)</span>
              </span>
            )}
            <span>Quality: <span className="text-white font-medium">{asset.qualityScore}/100</span></span>
            <span>{asset.downloadCount} downloads</span>
          </div>
        </div>

        {/* 0G Storage info */}
        <div className="px-5 py-3 border-b border-white/5 bg-cyan-500/5 flex-shrink-0">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-cyan-400">
              <Database className="w-3 h-3" />
              <span className="font-semibold">Stored on 0G Network</span>
            </div>
            {asset.storageId && (
              <span className="font-mono text-slate-500">
                ID: {asset.storageId.slice(0, 20)}...
              </span>
            )}
            {asset.rootHash && (
              <span className="font-mono text-slate-500">
                Root: {asset.rootHash.slice(0, 12)}...
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {ownedByActive ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Full Content</h3>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className="prose prose-invert prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm text-slate-300 leading-relaxed">
                  {asset.content}
                </pre>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-sm text-slate-300 mb-4 leading-relaxed">{asset.description}</div>
              <div className="glass-card p-4 border border-amber-500/20 bg-amber-500/5 text-center">
                <Download className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                <p className="text-sm text-slate-300 font-medium mb-1">Full content locked</p>
                <p className="text-xs text-slate-500">
                  Purchase this asset to unlock full content retrieved from 0G Storage
                </p>
              </div>

              {/* Preview snippet */}
              <div className="mt-4">
                <div className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Preview (first 500 chars)</div>
                <div className="text-sm text-slate-400 leading-relaxed blur-sm select-none">
                  {asset.content.slice(0, 500)}...
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!ownedByActive && onPurchase && (
          <div className="p-5 border-t border-white/5 flex-shrink-0 flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white">{asset.price}<span className="text-base text-slate-400 ml-1">Ⓐ</span></div>
              <div className="text-xs text-slate-500">Ownership recorded on 0G Chain</div>
            </div>
            <button
              onClick={onPurchase}
              className="flex items-center gap-2 px-6 py-2.5 bg-forge-600 hover:bg-forge-500 text-white font-semibold rounded-xl transition-colors"
            >
              <Download className="w-4 h-4" />
              Acquire Asset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
