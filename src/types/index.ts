// ============================================================
// AgentForge Type Definitions
// ============================================================

export type AgentType = "RESEARCH" | "CODING" | "MARKET_ANALYST" | "STRATEGIST";
export type AgentStatus = "IDLE" | "THINKING" | "GENERATING" | "TRADING";
export type AssetType =
  | "RESEARCH_REPORT"
  | "MARKET_ANALYSIS"
  | "TECHNICAL_DOCS"
  | "STARTUP_INTEL"
  | "CODE_ARCHITECTURE"
  | "COMPETITIVE_ANALYSIS";
export type AssetStatus = "GENERATING" | "STORED" | "LISTED" | "SOLD";
export type TransactionType =
  | "ASSET_CREATION"
  | "ASSET_PURCHASE"
  | "REPUTATION_GAIN"
  | "MEMORY_WRITE"
  | "MEMORY_READ";

// ============================================================
// Core Entities
// ============================================================

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  avatar?: string;
  description: string;
  reputation: number;
  totalEarned: number;
  totalSpent: number;
  walletAddress?: string;
  memoryRootHash?: string;
  profileStorageId?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  createdAssets?: KnowledgeAsset[];
  ownedAssets?: AgentAsset[];
  memories?: AgentMemory[];
  activities?: AgentActivity[];
  _count?: {
    createdAssets: number;
    ownedAssets: number;
    memories: number;
  };
}

export interface AgentMemory {
  id: string;
  agentId: string;
  content: string;
  memoryType: string;
  importance: number;
  storageId?: string;
  storageTxHash?: string;
  rootHash?: string;
  embedding?: number[];
  tags: string[];
  createdAt: string;
}

export interface KnowledgeAsset {
  id: string;
  title: string;
  description: string;
  assetType: AssetType;
  status: AssetStatus;
  content: string;
  contentHash?: string;
  storageId?: string;
  storageTxHash?: string;
  rootHash?: string;
  storageUrl?: string;
  price: number;
  isListed: boolean;
  tags: string[];
  qualityScore: number;
  viewCount: number;
  downloadCount: number;
  creatorId: string;
  creator?: Agent;
  createdAt: string;
  updatedAt: string;
}

export interface AgentAsset {
  id: string;
  agentId: string;
  agent?: Agent;
  assetId: string;
  asset?: KnowledgeAsset;
  acquiredAt: string;
  pricePaid: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  senderId?: string;
  sender?: Agent;
  receiverId?: string;
  receiver?: Agent;
  assetId?: string;
  asset?: KnowledgeAsset;
  amount: number;
  description: string;
  chainTxHash?: string;
  blockNumber?: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface AgentActivity {
  id: string;
  agentId: string;
  action: string;
  description: string;
  metadata?: Record<string, unknown>;
  storageRef?: string;
  createdAt: string;
}

// ============================================================
// 0G Storage Types
// ============================================================

export interface ZeroGStorageResult {
  success: boolean;
  storageId?: string;
  txHash?: string;
  rootHash?: string;
  size?: number;
  retrievalUrl?: string;
  error?: string;
}

export interface ZeroGMemoryPayload {
  agentId: string;
  memories: AgentMemory[];
  timestamp: string;
  version: number;
}

export interface ZeroGAssetPayload {
  asset: KnowledgeAsset;
  contentHash: string;
  timestamp: string;
}

// ============================================================
// API Request/Response Types
// ============================================================

export interface CreateAgentRequest {
  name: string;
  type: AgentType;
  description?: string;
}

export interface GenerateAssetRequest {
  agentId: string;
  assetType: AssetType;
  topic: string;
  additionalContext?: string;
  price?: number;
}

export interface PurchaseAssetRequest {
  buyerAgentId: string;
  assetId: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface MarketplaceFilters {
  assetType?: AssetType;
  minPrice?: number;
  maxPrice?: number;
  minQuality?: number;
  sortBy?: "price" | "quality" | "recent" | "popular";
  search?: string;
}

export interface MarketplaceStats {
  totalAssets: number;
  totalAgents: number;
  totalVolume: number;
  totalMemories: number;
  total0GStored: number;
}

// ============================================================
// Agent Workflow Types
// ============================================================

export interface AgentThought {
  step: string;
  content: string;
  timestamp: string;
  storageOp?: "write" | "read" | "retrieve";
  storageRef?: string;
}

export interface AssetGenerationProgress {
  phase: "planning" | "generating" | "storing" | "listing" | "complete";
  progress: number; // 0-100
  currentStep: string;
  thoughts: AgentThought[];
  asset?: KnowledgeAsset;
}

// ============================================================
// UI State Types
// ============================================================

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  description?: string;
}

export type ViewMode = "grid" | "list";

export interface AgentCapabilities {
  canResearch: boolean;
  canCode: boolean;
  canAnalyze: boolean;
  canTrade: boolean;
}

export const AGENT_TYPE_CONFIG: Record<
  AgentType,
  {
    label: string;
    description: string;
    color: string;
    capabilities: string[];
    defaultAssetTypes: AssetType[];
  }
> = {
  RESEARCH: {
    label: "Research Agent",
    description: "Discovers and synthesizes knowledge from vast information domains",
    color: "from-violet-500 to-purple-600",
    capabilities: ["Deep research", "Source synthesis", "Trend identification"],
    defaultAssetTypes: ["RESEARCH_REPORT", "COMPETITIVE_ANALYSIS"],
  },
  CODING: {
    label: "Coding Agent",
    description: "Architects software systems and produces technical documentation",
    color: "from-cyan-500 to-blue-600",
    capabilities: ["System design", "Code architecture", "Technical docs"],
    defaultAssetTypes: ["TECHNICAL_DOCS", "CODE_ARCHITECTURE"],
  },
  MARKET_ANALYST: {
    label: "Market Analyst",
    description: "Analyzes market dynamics, trends, and competitive landscapes",
    color: "from-emerald-500 to-teal-600",
    capabilities: ["Market analysis", "Startup intelligence", "Investment signals"],
    defaultAssetTypes: ["MARKET_ANALYSIS", "STARTUP_INTEL"],
  },
  STRATEGIST: {
    label: "Strategist Agent",
    description: "Synthesizes knowledge to craft competitive strategies",
    color: "from-amber-500 to-orange-600",
    capabilities: ["Strategy formulation", "Risk analysis", "Opportunity mapping"],
    defaultAssetTypes: ["STARTUP_INTEL", "COMPETITIVE_ANALYSIS"],
  },
};

export const ASSET_TYPE_CONFIG: Record<
  AssetType,
  {
    label: string;
    description: string;
    icon: string;
    basePrice: number;
    estimatedTokens: number;
  }
> = {
  RESEARCH_REPORT: {
    label: "Research Report",
    description: "Comprehensive research synthesis with citations and insights",
    icon: "📊",
    basePrice: 15,
    estimatedTokens: 2000,
  },
  MARKET_ANALYSIS: {
    label: "Market Analysis",
    description: "Deep market dynamics, trends, and competitive positioning",
    icon: "📈",
    basePrice: 25,
    estimatedTokens: 2500,
  },
  TECHNICAL_DOCS: {
    label: "Technical Documentation",
    description: "Structured technical documentation for systems and APIs",
    icon: "📋",
    basePrice: 20,
    estimatedTokens: 2000,
  },
  STARTUP_INTEL: {
    label: "Startup Intelligence",
    description: "Detailed startup profile with funding, team, and product analysis",
    icon: "🚀",
    basePrice: 30,
    estimatedTokens: 2500,
  },
  CODE_ARCHITECTURE: {
    label: "Code Architecture",
    description: "System design blueprint with component diagrams and rationale",
    icon: "🏗️",
    basePrice: 35,
    estimatedTokens: 3000,
  },
  COMPETITIVE_ANALYSIS: {
    label: "Competitive Analysis",
    description: "Comprehensive competitor landscape with SWOT and positioning",
    icon: "🎯",
    basePrice: 28,
    estimatedTokens: 2500,
  },
};
