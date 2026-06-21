"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Database, X, ExternalLink } from "lucide-react";
import { api } from "@/lib/api";

export function DemoModeBanner() {
  const [dismissed, setDismissed] = useState(false);

  const { data } = useQuery({
    queryKey: ["stats"],
    queryFn: () => api.get<{ mode: string }>("/api/stats"),
  });

  const isDemo = (data?.data as { mode?: string })?.mode === "demo";

  if (!isDemo || dismissed) return null;

  return (
    <div className="fixed top-20 left-0 right-0 z-40 px-4">
      <div className="max-w-2xl mx-auto glass-card border border-amber-500/25 bg-amber-500/5 px-4 py-2.5 flex items-center gap-3">
        <Database className="w-4 h-4 text-amber-400 flex-shrink-0" />
        <p className="text-xs text-amber-200 flex-1">
          <strong>Demo Mode</strong> — 0G operations are simulated. Add{" "}
          <code className="font-mono bg-amber-500/15 px-1 py-0.5 rounded">ZEROG_PRIVATE_KEY</code> to{" "}
          <code className="font-mono bg-amber-500/15 px-1 py-0.5 rounded">.env</code> for real 0G integration.{" "}
          <a
            href="https://faucet.0g.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-amber-100 inline-flex items-center gap-0.5"
          >
            Get testnet tokens <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </p>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-600 hover:text-amber-300 flex-shrink-0 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
