import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Agent, KnowledgeAsset, MarketplaceStats } from "@/types";

interface AppState {
  // Active agent (simulates "logged in" agent)
  activeAgentId: string | null;
  activeAgent: Agent | null;
  setActiveAgent: (agent: Agent | null) => void;

  // Agents list
  agents: Agent[];
  setAgents: (agents: Agent[]) => void;
  upsertAgent: (agent: Agent) => void;

  // Assets
  featuredAssets: KnowledgeAsset[];
  setFeaturedAssets: (assets: KnowledgeAsset[]) => void;

  // Stats
  marketplaceStats: MarketplaceStats | null;
  setMarketplaceStats: (stats: MarketplaceStats) => void;

  // UI state
  isGenerating: boolean;
  setIsGenerating: (v: boolean) => void;

  generationProgress: number;
  setGenerationProgress: (v: number) => void;

  generationPhase: string;
  setGenerationPhase: (v: string) => void;

  // 0G activity feed
  zeroGActivity: ZeroGActivityItem[];
  addZeroGActivity: (item: ZeroGActivityItem) => void;
  clearZeroGActivity: () => void;
}

export interface ZeroGActivityItem {
  id: string;
  timestamp: string;
  type: "upload" | "download" | "ownership" | "reputation" | "memory";
  description: string;
  storageId?: string;
  txHash?: string;
  size?: number;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeAgentId: null,
      activeAgent: null,
      setActiveAgent: (agent) =>
        set({ activeAgent: agent, activeAgentId: agent?.id ?? null }),

      agents: [],
      setAgents: (agents) => set({ agents }),
      upsertAgent: (agent) =>
        set((state) => {
          const idx = state.agents.findIndex((a) => a.id === agent.id);
          if (idx >= 0) {
            const updated = [...state.agents];
            updated[idx] = agent;
            return { agents: updated };
          }
          return { agents: [agent, ...state.agents] };
        }),

      featuredAssets: [],
      setFeaturedAssets: (assets) => set({ featuredAssets: assets }),

      marketplaceStats: null,
      setMarketplaceStats: (stats) => set({ marketplaceStats: stats }),

      isGenerating: false,
      setIsGenerating: (v) => set({ isGenerating: v }),

      generationProgress: 0,
      setGenerationProgress: (v) => set({ generationProgress: v }),

      generationPhase: "",
      setGenerationPhase: (v) => set({ generationPhase: v }),

      zeroGActivity: [],
      addZeroGActivity: (item) =>
        set((state) => ({
          zeroGActivity: [item, ...state.zeroGActivity].slice(0, 50),
        })),
      clearZeroGActivity: () => set({ zeroGActivity: [] }),
    }),
    {
      name: "agentforge-storage",
      partialize: (state) => ({
        activeAgentId: state.activeAgentId,
        activeAgent: state.activeAgent,
      }),
    }
  )
);
