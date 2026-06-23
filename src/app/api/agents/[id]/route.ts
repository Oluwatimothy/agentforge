import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id || id === "undefined") {
      return NextResponse.json(
        { success: false, error: "Agent ID required" },
        { status: 400 }
      );
    }
    const agent = await prisma.agent.findUnique({
      where: { id },
      include: {
        createdAssets: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        ownedAssets: {
          include: {
            asset: {
              include: {
                creator: {
                  select: { id: true, name: true, type: true },
                },
              },
            },
          },
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
    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [{ senderId: id }, { receiverId: id }],
      },
      include: {
        asset: {
          select: { id: true, title: true, assetType: true },
        },
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
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { status } = body;
    const agent = await prisma.agent.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json({ success: true, data: agent });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await prisma.agentActivity.deleteMany({ where: { agentId: id } });
    await prisma.agentMemory.deleteMany({ where: { agentId: id } });
    await prisma.transaction.deleteMany({
      where: { OR: [{ senderId: id }, { receiverId: id }] },
    });
    await prisma.agentAsset.deleteMany({ where: { agentId: id } });
    await prisma.knowledgeAsset.deleteMany({ where: { creatorId: id } });
    await prisma.agent.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Agent deleted" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
