"use client";

import { Database } from "lucide-react";
import { clsx } from "clsx";

interface ZeroGBadgeProps {
  showDot?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function ZeroGBadge({ showDot = false, size = "sm", className }: ZeroGBadgeProps) {
  return (
    <div className={clsx("zerog-badge", className)}>
      {showDot && (
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse flex-shrink-0" />
      )}
      <Database className="w-3 h-3 flex-shrink-0" />
      <span>0G Network</span>
    </div>
  );
}

interface ZeroGStorageTagProps {
  storageId?: string;
  txHash?: string;
  rootHash?: string;
  className?: string;
}

export function ZeroGStorageTag({ storageId, txHash, rootHash, className }: ZeroGStorageTagProps) {
  const ref = storageId || txHash || rootHash;
  if (!ref) return null;
  const shortRef = ref.slice(0, 10) + "..." + ref.slice(-6);

  // Wallet addresses (42 chars starting with 0x) go to /address/
  // Transaction hashes (66 chars) go to /tx/
  const isAddress = ref.length === 42;
  const explorer = process.env.NEXT_PUBLIC_ZEROG_EXPLORER || "https://chainscan-galileo.0g.ai";
  const storageScan = process.env.NEXT_PUBLIC_ZEROG_STORAGE_SCAN || "https://storagescan-galileo.0g.ai";
  
  const href = isAddress
    ? `${explorer}/address/${ref}`
    : txHash
    ? `${storageScan}/tx/${txHash}`
    : `${storageScan}/tx/${ref}`;

  return (
    
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={clsx(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono",
        "bg-cyan-500/8 border border-cyan-500/20 text-cyan-400/80 hover:text-cyan-300 hover:border-cyan-500/40",
        "transition-colors cursor-pointer",
        className
      )}
      title={`View on 0G: ${ref}`}
    >
      <Database className="w-2.5 h-2.5" />
      {shortRef}
    </a>
  );
}

interface ZeroGStatusBarProps {
  operations: Array<{
    label: string;
    status: "pending" | "complete" | "error";
    ref?: string;
  }>;
}

export function ZeroGStatusBar({ operations }: ZeroGStatusBarProps) {
  return (
    <div className="glass-card p-3 space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <Database className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">0G Operations</span>
      </div>
      {operations.map((op, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div
            className={clsx(
              "w-2 h-2 rounded-full flex-shrink-0",
              op.status === "complete" && "bg-emerald-400",
              op.status === "pending" && "bg-amber-400 animate-pulse",
              op.status === "error" && "bg-red-400"
            )}
          />
          <span
            className={clsx(
              op.status === "complete" && "text-slate-300",
              op.status === "pending" && "text-amber-300",
              op.status === "error" && "text-red-300"
            )}
          >
            {op.label}
          </span>
          {op.ref && op.status === "complete" && (
            <span className="text-slate-600 font-mono ml-auto">
              {op.ref.slice(0, 8)}...
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
