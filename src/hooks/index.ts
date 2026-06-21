import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Agent, KnowledgeAsset, AgentMemory, Transaction } from "@/types";
import toast from "react-hot-toast";
import { useAppStore } from "@/store";

// ============================================================
// Agent Hooks
// ============================================================

export function useAgents() {
  return useQuery({
    queryKey: ["agents"],
    queryFn: () => api.get<Agent[]>("/api/agents"),
    refetchInterval: 10_000,
    select: (data) => data.data || [],
  });
}

export function useAgent(id: string | null) {
  return useQuery({
    queryKey: ["agent", id],
    queryFn: () => api.get<Agent & { transactions: Transaction[] }>(`/api/agents/${id}`),
    enabled: !!id,
    refetchInterval: 5_000,
    select: (data) => data.data,
  });
}

export function useCreateAgent() {
  const queryClient = useQueryClient();
  const { setActiveAgent, upsertAgent } = useAppStore();

  return useMutation({
    mutationFn: (data: { name: string; type: string }) =>
      api.post<Agent>("/api/agents", data),
    onSuccess: (res) => {
      if (res.success && res.data) {
        upsertAgent(res.data);
        setActiveAgent(res.data);
        queryClient.invalidateQueries({ queryKey: ["agents"] });
        toast.success(`${res.data.name} deployed to 0G Network!`);
      }
    },
    onError: (err) => toast.error(String(err)),
  });
}

// ============================================================
// Asset Hooks
// ============================================================

export function useAssets(filters?: {
  assetType?: string;
  creatorId?: string;
  listed?: boolean;
}) {
  const params = new URLSearchParams();
  if (filters?.assetType) params.set("assetType", filters.assetType);
  if (filters?.creatorId) params.set("creatorId", filters.creatorId);
  if (filters?.listed) params.set("listed", "true");

  return useQuery({
    queryKey: ["assets", filters],
    queryFn: () => api.get<KnowledgeAsset[]>(`/api/assets?${params}`),
    refetchInterval: 10_000,
    select: (data) => data.data || [],
  });
}

export function useGenerateAsset() {
  const queryClient = useQueryClient();
  const { setIsGenerating, addZeroGActivity } = useAppStore();

  return useMutation({
    mutationFn: (data: {
      agentId: string;
      assetType: string;
      topic: string;
      price?: number;
    }) => api.post<KnowledgeAsset>("/api/assets", data),
    onMutate: () => setIsGenerating(true),
    onSuccess: (res) => {
      setIsGenerating(false);
      if (res.success && res.data) {
        const zeroG = (res as { zeroG?: { storageId?: string; txHash?: string } }).zeroG;
        addZeroGActivity({
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          type: "upload",
          description: `Asset stored: ${res.data.title}`,
          storageId: zeroG?.storageId,
          txHash: zeroG?.txHash,
        });
        queryClient.invalidateQueries({ queryKey: ["assets"] });
        queryClient.invalidateQueries({ queryKey: ["agents"] });
        toast.success(`Asset stored on 0G!`);
      }
    },
    onError: (err) => {
      setIsGenerating(false);
      toast.error(String(err));
    },
  });
}

// ============================================================
// Marketplace Hooks
// ============================================================

export function useMarketplace(filters?: {
  assetType?: string;
  search?: string;
  sortBy?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.assetType) params.set("assetType", filters.assetType);
  if (filters?.search) params.set("search", filters.search);
  if (filters?.sortBy) params.set("sortBy", filters.sortBy);

  return useQuery({
    queryKey: ["marketplace", filters],
    queryFn: () => api.get<KnowledgeAsset[]>(`/api/marketplace?${params}`),
    refetchInterval: 8_000,
  });
}

export function usePurchaseAsset() {
  const queryClient = useQueryClient();
  const { addZeroGActivity } = useAppStore();

  return useMutation({
    mutationFn: (data: { buyerAgentId: string; assetId: string }) =>
      api.post("/api/marketplace", data),
    onSuccess: (res) => {
      if (res.success) {
        const zeroG = (res as { zeroG?: { ownershipStorageId?: string; ownershipTxHash?: string } }).zeroG;
        addZeroGActivity({
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          type: "ownership",
          description: "Ownership recorded on 0G Chain",
          storageId: zeroG?.ownershipStorageId,
          txHash: zeroG?.ownershipTxHash,
        });
        queryClient.invalidateQueries({ queryKey: ["marketplace"] });
        queryClient.invalidateQueries({ queryKey: ["agents"] });
        toast.success("Asset acquired! Ownership on 0G Chain.");
      }
    },
    onError: (err) => toast.error(String(err)),
  });
}

// ============================================================
// Memory Hooks
// ============================================================

export function useMemories(agentId: string | null) {
  return useQuery({
    queryKey: ["memories", agentId],
    queryFn: () => api.get<AgentMemory[]>(`/api/memory?agentId=${agentId}`),
    enabled: !!agentId,
    refetchInterval: 5_000,
    select: (data) => data.data || [],
  });
}

export function useStoreMemory() {
  const queryClient = useQueryClient();
  const { addZeroGActivity } = useAppStore();

  return useMutation({
    mutationFn: (data: {
      agentId: string;
      content: string;
      memoryType?: string;
      importance?: number;
    }) => api.post<AgentMemory>("/api/memory", data),
    onSuccess: (res, vars) => {
      if (res.success) {
        const zeroG = (res as { zeroG?: { storageId?: string; txHash?: string } }).zeroG;
        addZeroGActivity({
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          type: "memory",
          description: `Memory written to 0G: "${vars.content.slice(0, 40)}..."`,
          storageId: zeroG?.storageId,
          txHash: zeroG?.txHash,
        });
        queryClient.invalidateQueries({ queryKey: ["memories"] });
      }
    },
  });
}

// ============================================================
// Leaderboard Hooks
// ============================================================

export function useLeaderboard() {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => api.get<Agent[]>("/api/reputation"),
    refetchInterval: 15_000,
    select: (data) => data.data || [],
  });
}
