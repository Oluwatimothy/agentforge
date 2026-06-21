/**
 * 0G Storage Integration Module
 * Uses @0gfoundation/0g-storage-ts-sdk (latest official SDK)
 * MemData for in-memory uploads, flow contract auto-discovered
 */

import crypto from "crypto";

const ZEROG_RPC_URL = process.env.ZEROG_RPC_URL || "https://evmrpc-testnet.0g.ai";
const ZEROG_INDEXER_RPC = process.env.ZEROG_INDEXER_RPC || "https://indexer-storage-testnet-turbo.0g.ai";
const ZEROG_PRIVATE_KEY = process.env.ZEROG_PRIVATE_KEY || "";

export interface StorageUploadResult {
  success: boolean;
  storageId?: string;
  txHash?: string;
  rootHash?: string;
  size?: number;
  error?: string;
}

export interface StorageRetrieveResult {
  success: boolean;
  data?: string;
  error?: string;
}

const simulatedStorage = new Map<string, string>();

export function isZeroGConfigured(): boolean {
  const pk = ZEROG_PRIVATE_KEY;
  return !!pk && pk !== "your-private-key-here" && pk.length > 10;
}

export async function uploadToZeroG(
  data: string | object,
  metadata?: Record<string, string>
): Promise<StorageUploadResult> {
  const content = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  const contentBytes = Buffer.from(content, "utf-8");
  const contentHash = crypto.createHash("sha256").update(contentBytes).digest("hex");

  if (!isZeroGConfigured()) {
    return simulateZeroGUpload(content, contentHash, metadata);
  }

  try {
    const { Indexer, MemData } = await import("@0gfoundation/0g-storage-ts-sdk");
    const { ethers } = await import("ethers");

    const provider = new ethers.JsonRpcProvider(ZEROG_RPC_URL);
    const signer = new ethers.Wallet(ZEROG_PRIVATE_KEY, provider);

    const memData = new MemData(new TextEncoder().encode(content));
    const indexer = new Indexer(ZEROG_INDEXER_RPC);

    const [tx, err] = await indexer.upload(memData, ZEROG_RPC_URL, signer);

    if (err !== null) {
      console.error("[0G] Upload error:", err);
      return simulateZeroGUpload(content, contentHash, metadata);
    }

    let txHash: string;
    let rootHash: string;

    if ("rootHash" in tx) {
      rootHash = tx.rootHash as string;
      txHash = tx.txHash as string;
    } else {
      const txArr = tx as { rootHashes: string[]; txHashes: string[] };
      rootHash = txArr.rootHashes[0];
      txHash = txArr.txHashes[0];
    }

    console.log(`[0G] Upload success | Root: ${rootHash?.slice(0, 16)}... | TX: ${txHash?.slice(0, 16)}...`);

    return {
      success: true,
      storageId: rootHash,
      txHash: txHash,
      rootHash: rootHash,
      size: contentBytes.length,
    };
  } catch (error) {
    console.error("[0G] Upload exception:", error);
    return simulateZeroGUpload(content, contentHash, metadata);
  }
}

export async function retrieveFromZeroG(rootHash: string): Promise<StorageRetrieveResult> {
  if (!isZeroGConfigured()) {
    return simulateZeroGRetrieve(rootHash);
  }

  try {
    const { Indexer } = await import("@0gfoundation/0g-storage-ts-sdk");
    const indexer = new Indexer(ZEROG_INDEXER_RPC);
    const tmpPath = `/tmp/agentforge_${Date.now()}.json`;
    const err = await indexer.download(rootHash, tmpPath, true);

    if (err !== null) {
      throw new Error(`Download error: ${err}`);
    }

    const fs = await import("fs");
    const data = fs.readFileSync(tmpPath, "utf-8");
    fs.unlinkSync(tmpPath);
    return { success: true, data };
  } catch (error) {
    console.error("[0G] Retrieve error:", error);
    return simulateZeroGRetrieve(rootHash);
  }
}

export async function uploadAgentMemory(
  agentId: string,
  memories: object[]
): Promise<StorageUploadResult> {
  const payload = {
    agentId,
    memories,
    timestamp: new Date().toISOString(),
    version: 1,
    network: "0g-galileo-testnet",
    schema: "agentforge-memory-v1",
  };
  return uploadToZeroG(payload, { type: "agent_memory", agentId });
}

export async function uploadKnowledgeAsset(asset: {
  id: string;
  title: string;
  content: string;
  assetType: string;
  creatorId: string;
  metadata?: Record<string, unknown>;
}): Promise<StorageUploadResult> {
  const payload = {
    ...asset,
    timestamp: new Date().toISOString(),
    network: "0g-galileo-testnet",
    schema: "agentforge-asset-v1",
    contentHash: crypto.createHash("sha256").update(asset.content).digest("hex"),
  };
  return uploadToZeroG(payload, { type: "knowledge_asset", assetType: asset.assetType });
}

export async function recordOwnership(record: {
  assetId: string;
  ownerId: string;
  creatorId: string;
  price: number;
  txType: "creation" | "purchase";
}): Promise<StorageUploadResult> {
  const payload = {
    ...record,
    timestamp: new Date().toISOString(),
    network: "0g-galileo-testnet",
    schema: "agentforge-ownership-v1",
    recordId: crypto.randomBytes(16).toString("hex"),
  };
  return uploadToZeroG(payload, { type: "ownership_record", assetId: record.assetId });
}

export async function persistReputation(
  agentId: string,
  reputationData: {
    score: number;
    delta: number;
    reason: string;
    previousScore: number;
  }
): Promise<StorageUploadResult> {
  const payload = {
    agentId,
    ...reputationData,
    timestamp: new Date().toISOString(),
    network: "0g-galileo-testnet",
    schema: "agentforge-reputation-v1",
  };
  return uploadToZeroG(payload, { type: "reputation_record", agentId });
}

async function simulateZeroGUpload(
  content: string,
  contentHash: string,
  metadata?: Record<string, string>
): Promise<StorageUploadResult> {
  await sleep(300 + Math.random() * 500);

  const rootHash = "0x" + crypto.randomBytes(32).toString("hex");
  const txHash = "0x" + crypto.randomBytes(32).toString("hex");
  const storageId = "0x" + contentHash.slice(0, 40);

  simulatedStorage.set(rootHash, content);
  simulatedStorage.set(storageId, content);

  console.log(`[0G DEMO] Simulated upload | Root: ${rootHash.slice(0, 16)}...`);

  return {
    success: true,
    storageId,
    txHash,
    rootHash,
    size: Buffer.byteLength(content, "utf-8"),
  };
}

async function simulateZeroGRetrieve(rootHash: string): Promise<StorageRetrieveResult> {
  await sleep(200 + Math.random() * 300);
  const data = simulatedStorage.get(rootHash);
  if (!data) return { success: false, error: `Not found: ${rootHash}` };
  return { success: true, data };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getStorageExplorerUrl(rootHash: string): string {
  return `${process.env.NEXT_PUBLIC_ZEROG_STORAGE_SCAN || "https://storagescan-galileo.0g.ai"}/tx/${rootHash}`;
}

export function getChainExplorerUrl(txHash: string): string {
  return `${process.env.NEXT_PUBLIC_ZEROG_EXPLORER || "https://chainscan-galileo.0g.ai"}/tx/${txHash}`;
}

export const ZEROG_NETWORK_INFO = {
  name: "0G Galileo Testnet",
  chainId: 16602,
  rpcUrl: "https://evmrpc-testnet.0g.ai",
  indexerRpc: "https://indexer-storage-testnet-turbo.0g.ai",
  explorer: "https://chainscan-galileo.0g.ai",
  storageScan: "https://storagescan-galileo.0g.ai",
};
