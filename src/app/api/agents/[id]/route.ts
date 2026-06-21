import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { retrieveFromZeroG } from "@/lib/0g/storage";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agent = await prisma.agent.findUnique({
      where: { id: params.id },
      include: {
        createdAssets: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        ownedAssets: {
          include: { asset: { include: { creator: true } } },
          orderBy: { acquiredAt: "desc" },
          take: 10,
        },
        memories: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        activities: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        _count: {
          select: {
            createdAssets: true,
            ownedAssets: true,
            memories: true,
          },
        },
      },
    });

    if (!agent) {
      return NextResponse.json(
        { success: false, error: "Agent not found" },
        { status: 404 }
      );
    }

    // Fetch agent transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [{ senderId: params.id }, { receiverId: params.id }],
      },
      include: {
        asset: true,
        sender: { select: { id: true, name: true, type: true } },
        receiver: { select: { id: true, name: true, type: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      data: { ...agent, transactions },
    });
  } catch (error) {
    console.error("GET /api/agents/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch agent" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { status } = body;

    const agent = await prisma.agent.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json({ success: true, data: agent });
  } catch (error) {
    console.error("PUT /api/agents/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update agent" },
      { status: 500 }
    );
  }
}
