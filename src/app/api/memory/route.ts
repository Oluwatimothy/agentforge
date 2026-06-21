import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { uploadAgentMemory, retrieveFromZeroG } from "@/lib/0g/storage";

// GET /api/memory?agentId=xxx - Retrieve agent memories (from 0G)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get("agentId");
    const rootHash = searchParams.get("rootHash");

    if (!agentId) {
      return NextResponse.json(
        { success: false, error: "agentId required" },
        { status: 400 }
      );
    }

    // If rootHash provided, retrieve directly from 0G
    if (rootHash) {
      const result = await retrieveFromZeroG(rootHash);
      if (result.success && result.data) {
        try {
          const parsed = JSON.parse(result.data);
          return NextResponse.json({
            success: true,
            data: parsed,
            source: "0g_storage",
            rootHash,
          });
        } catch {
          return NextResponse.json({
            success: false,
            error: "Failed to parse 0G data",
          });
        }
      }
    }

    // Retrieve from local DB (indexed from 0G)
    const memories = await prisma.agentMemory.findMany({
      where: { agentId },
      orderBy: [{ importance: "desc" }, { createdAt: "desc" }],
      take: 50,
    });

    return NextResponse.json({
      success: true,
      data: memories,
      source: "local_index",
      count: memories.length,
    });
  } catch (error) {
    console.error("GET /api/memory error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve memories" },
      { status: 500 }
    );
  }
}

// POST /api/memory - Store new memory on 0G
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agentId, content, memoryType, importance, tags } = body;

    if (!agentId || !content) {
      return NextResponse.json(
        { success: false, error: "agentId and content required" },
        { status: 400 }
      );
    }

    // Fetch existing memories to batch upload
    const existingMemories = await prisma.agentMemory.findMany({
      where: { agentId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const newMemoryData = {
      agentId,
      content,
      memoryType: memoryType || "general",
      importance: importance || 0.5,
      tags: tags || [],
      timestamp: new Date().toISOString(),
    };

    const allMemories = [newMemoryData, ...existingMemories];

    // Upload memory batch to 0G Storage
    const storageResult = await uploadAgentMemory(agentId, allMemories);

    // Save to local DB
    const memory = await prisma.agentMemory.create({
      data: {
        agentId,
        content,
        memoryType: memoryType || "general",
        importance: importance || 0.5,
        tags: tags || [],
        storageId: storageResult.storageId,
        storageTxHash: storageResult.txHash,
        rootHash: storageResult.rootHash,
      },
    });

    // Update agent's memory root hash
    await prisma.agent.update({
      where: { id: agentId },
      data: { memoryRootHash: storageResult.rootHash },
    });

    // Log transaction
    await prisma.transaction.create({
      data: {
        type: "MEMORY_WRITE",
        senderId: agentId,
        description: `Memory stored on 0G Network: "${content.slice(0, 60)}..."`,
        chainTxHash: storageResult.txHash,
        metadata: {
          storageId: storageResult.storageId,
          rootHash: storageResult.rootHash,
          memoryType,
          size: storageResult.size,
        },
      },
    });

    // Update storage stats
    await prisma.marketplaceStats.upsert({
      where: { id: "singleton" },
      update: {
        totalMemories: { increment: 1 },
        total0GStored: { increment: BigInt(storageResult.size || 0) },
      },
      create: {
        id: "singleton",
        totalMemories: 1,
        total0GStored: BigInt(storageResult.size || 0),
      },
    });

    return NextResponse.json({
      success: true,
      data: memory,
      zeroG: {
        storageId: storageResult.storageId,
        txHash: storageResult.txHash,
        rootHash: storageResult.rootHash,
        size: storageResult.size,
      },
    });
  } catch (error) {
    console.error("POST /api/memory error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to store memory" },
      { status: 500 }
    );
  }
}
