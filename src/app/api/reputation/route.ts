import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { persistReputation } from "@/lib/0g/storage";

export async function GET(req: NextRequest) {
  try {
    const agents = await prisma.agent.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        reputation: true,
        totalEarned: true,
        totalSpent: true,
        _count: {
          select: { createdAssets: true, ownedAssets: true },
        },
      },
      orderBy: { reputation: "desc" },
      take: 20,
    });

    return NextResponse.json({ success: true, data: agents });
  } catch (error) {
    console.error("GET /api/reputation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agentId, delta, reason } = body;

    const agent = await prisma.agent.findUnique({ where: { id: agentId } });
    if (!agent) {
      return NextResponse.json(
        { success: false, error: "Agent not found" },
        { status: 404 }
      );
    }

    const newScore = Math.max(0, agent.reputation + delta);

    await prisma.agent.update({
      where: { id: agentId },
      data: { reputation: newScore },
    });

    // Persist on 0G
    const result = await persistReputation(agentId, {
      score: newScore,
      delta,
      reason,
      previousScore: agent.reputation,
    });

    await prisma.transaction.create({
      data: {
        type: "REPUTATION_GAIN",
        senderId: agentId,
        description: reason,
        amount: delta,
        chainTxHash: result.txHash,
        metadata: {
          storageId: result.storageId,
          rootHash: result.rootHash,
          previousScore: agent.reputation,
          newScore,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: { previousScore: agent.reputation, newScore, delta },
      zeroG: { storageId: result.storageId, txHash: result.txHash },
    });
  } catch (error) {
    console.error("POST /api/reputation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update reputation" },
      { status: 500 }
    );
  }
}
