import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const agentId = searchParams.get("agentId");
    const type = searchParams.get("type");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: Record<string, unknown> = {};
    if (agentId) {
      where.OR = [{ senderId: agentId }, { receiverId: agentId }];
    }
    if (type) where.type = type;

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        sender: { select: { id: true, name: true, type: true } },
        receiver: { select: { id: true, name: true, type: true } },
        asset: { select: { id: true, title: true, assetType: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ success: true, data: transactions });
  } catch (error) {
    console.error("GET /api/transactions error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}
