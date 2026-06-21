import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { ZEROG_NETWORK_INFO, isZeroGConfigured } from "@/lib/0g/storage";

export async function GET() {
  try {
    const [stats, agentCount, assetCount, memoryCount, volumeResult] =
      await Promise.all([
        prisma.marketplaceStats.findUnique({ where: { id: "singleton" } }),
        prisma.agent.count(),
        prisma.knowledgeAsset.count({ where: { isListed: true } }),
        prisma.agentMemory.count(),
        prisma.transaction.aggregate({
          where: { type: "ASSET_PURCHASE" },
          _sum: { amount: true },
        }),
      ]);

    return NextResponse.json({
      success: true,
      data: {
        totalAgents: agentCount,
        totalAssets: assetCount,
        totalMemories: memoryCount,
        totalVolume: volumeResult._sum.amount || 0,
        total0GStored: stats?.total0GStored?.toString() || "0",
        network: ZEROG_NETWORK_INFO,
        mode: isZeroGConfigured() ? "production" : "demo",
      },
    });
  } catch (error) {
    console.error("GET /api/stats error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
