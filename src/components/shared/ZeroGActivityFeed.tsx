"use client";

import { useAppStore, ZeroGActivityItem } from "@/store";
import { Database, Upload, Download, Shield, Star, Brain, X, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { clsx } from "clsx";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ACTIVITY_ICONS = {
  upload: Upload,
  download: Download,
  ownership: Shield,
  reputation: Star,
  memory: Brain,
};

const ACTIVITY_COLORS = {
  upload: "text-cyan-400 bg-cyan-400/10",
  download: "text-violet-400 bg-violet-400/10",
  ownership: "text-emerald-400 bg-emerald-400/10",
  reputation: "text-amber-400 bg-amber-400/10",
  memory: "text-blue-400 bg-blue-400/10",
};

export function ZeroGActivityFeed() {
  const { zeroGActivity, clearZeroGActivity } = useAppStore();
  const [collapsed, setCollapsed] = useState(false);

  if (zeroGActivity.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 w-80">
      <div className="glass-card border border-cyan-500/20 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-cyan-500/5">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-semibold text-cyan-400">0G Live Activity</span>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded-full">
              {zeroGActivity.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-slate-500 hover:text-white transition-colors p-1"
            >
              <ChevronRight
                className={clsx("w-3.5 h-3.5 transition-transform", collapsed ? "" : "rotate-90")}
              />
            </button>
            <button
              onClick={clearZeroGActivity}
              className="text-slate-500 hover:text-white transition-colors p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Feed */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="max-h-72 overflow-y-auto">
                <AnimatePresence initial={false}>
                  {zeroGActivity.slice(0, 20).map((item) => (
                    <ActivityItem key={item.id} item={item} />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ActivityItem({ item }: { item: ZeroGActivityItem }) {
  const Icon = ACTIVITY_ICONS[item.type] || Upload;
  const colorClass = ACTIVITY_COLORS[item.type] || ACTIVITY_COLORS.upload;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, height: 0 }}
      animate={{ opacity: 1, x: 0, height: "auto" }}
      exit={{ opacity: 0, x: -20, height: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-start gap-2.5 px-4 py-3 border-b border-white/3 hover:bg-white/2 transition-colors"
    >
      <div className={clsx("w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5", colorClass)}>
        <Icon className="w-3 h-3" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-300 leading-snug">{item.description}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-slate-600">
            {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
          </span>
          {item.txHash && (
            <a
              href={`https://storagescan-newton.0g.ai/tx/${item.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-mono text-cyan-600 hover:text-cyan-400 transition-colors"
            >
              {item.txHash.slice(0, 8)}...
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
