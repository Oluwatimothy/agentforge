import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import {
  uploadToZeroG,
  persistReputation,
} from "@/lib/0g/storage";
import { generateAgentDescription } from "@/lib/ai/generator";
import { AGENT_TYPE_CONFIG } from "@/types";
import { AgentType } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") as AgentType | null;

    const agents = await prisma.agent.findMany({
      where: type ? { type } : undefined,
      include: {
        _count: {
          select: {
            createdAssets: true,
            ownedAssets: true,
            memories: true,
          },
        },
      },
      orderBy: { reputation: "desc" },
      take: 50,
    });

    return NextResponse.json({ success: true, data: agents });
  } catch (error) {
    console.error("GET /api/agents error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch agents" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, type, description } = body;

    if (!name || !type) {
      return NextResponse.json(
        { success: false, error: "Name and type are required" },
        { status: 400 }
      );
    }

    // Generate description if not provided
    const agentDescription =
      description || (await generateAgentDescription(type, name));

    // Generate wallet address (in production, derive from 0G chain)
    const { ethers } = await import("ethers");
    const wallet = ethers.Wallet.createRandom();

    // Create agent in DB
    const agent = await prisma.agent.create({
      data: {
        name,
        type: type as AgentType,
        description: agentDescription,
        walletAddress: wallet.address,
        reputation: 10, // Starting reputation
      },
    });

    // Store agent profile on 0G Storage
    const profilePayload = {
      agentId: agent.id,
      name: agent.name,
      type: agent.type,
      description: agent.description,
      walletAddress: agent.walletAddress,
      reputation: agent.reputation,
      createdAt: agent.createdAt,
      schema: "agentforge-agent-profile-v1",
      network: "0g-testnet",
    };

    const storageResult = await uploadToZeroG(profilePayload, {
      type: "agent_profile",
      agentId: agent.id,
      agentType: type,
    });

 // Update agent with 0G storage reference - save txHash for explorer links
    const updatedAgent = await prisma.agent.update({
      where: { id: agent.id },
      data: {
        profileStorageId: storageResult.txHash,
      },
    });

    // Record initial reputation on 0G
    await persistReputation(agent.id, {
      score: 10,
      delta: 10,
      reason: "Agent initialization",
      previousScore: 0,
    });

    // Log activity
    await prisma.agentActivity.create({
      data: {
        agentId: agent.id,
        action: "agent_created",
        description: `Agent ${name} created and registered on 0G Network`,
        storageRef: storageResult.storageId,
        metadata: {
          storageId: storageResult.storageId,
          txHash: storageResult.txHash,
          profileRootHash: storageResult.rootHash,
        },
      },
    });

    // Create initial memory
    await prisma.agentMemory.create({
      data: {
        agentId: agent.id,
        content: `I am ${name}, a ${AGENT_TYPE_CONFIG[type as keyof typeof AGENT_TYPE_CONFIG]?.label || type} agent. I was initialized on the AgentForge knowledge economy. My mission is to create valuable knowledge assets and build my reputation through quality work.`,
        memoryType: "initialization",
        importance: 1.0,
        storageId: storageResult.storageId,
        tags: ["initialization", "identity", type.toLowerCase()],
      },
    });

    // Update marketplace stats
    await prisma.marketplaceStats.upsert({
      where: { id: "singleton" },
      update: { totalAgents: { increment: 1 } },
      create: { id: "singleton", totalAgents: 1 },
    });

    return NextResponse.json({
      success: true,
      data: updatedAgent,
      message: `Agent ${name} created and registered on 0G Network`,
      zeroG: {
        storageId: storageResult.storageId,
        txHash: storageResult.txHash,
        rootHash: storageResult.rootHash,
      },
    });
  } catch (error) {
    console.error("POST /api/agents error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create agent" },
      { status: 500 }
    );
  }
}
