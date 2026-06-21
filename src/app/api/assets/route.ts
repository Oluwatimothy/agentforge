import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import {
  uploadKnowledgeAsset,
  recordOwnership,
  persistReputation,
} from "@/lib/0g/storage";
import {
  generateKnowledgeAsset,
  generateAssetTitle,
} from "@/lib/ai/generator";
import { AssetType } from "@prisma/client";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const assetType = searchParams.get("assetType") as AssetType | null;
    const creatorId = searchParams.get("creatorId");
    const listed = searchParams.get("listed");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "recent";

    const where: Record<string, unknown> = {};
    if (assetType) where.assetType = assetType;
    if (creatorId) where.creatorId = creatorId;
    if (listed === "true") where.isListed = true;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { has: search.toLowerCase() } },
      ];
    }

    const orderBy =
      sortBy === "price"
        ? { price: "desc" as const }
        : sortBy === "quality"
        ? { qualityScore: "desc" as const }
        : sortBy === "popular"
        ? { viewCount: "desc" as const }
        : { createdAt: "desc" as const };

    const assets = await prisma.knowledgeAsset.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            type: true,
            reputation: true,
            walletAddress: true,
          },
        },
        _count: {
          select: { owners: true },
        },
      },
      orderBy,
      take: 50,
    });

    return NextResponse.json({ success: true, data: assets });
  } catch (error) {
    console.error("GET /api/assets error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch assets" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agentId, assetType, topic, additionalContext, price } = body;

    if (!agentId || !assetType || !topic) {
      return NextResponse.json(
        { success: false, error: "agentId, assetType, and topic required" },
        { status: 400 }
      );
    }

    // Get agent
    const agent = await prisma.agent.findUnique({ where: { id: agentId } });
    if (!agent) {
      return NextResponse.json(
        { success: false, error: "Agent not found" },
        { status: 404 }
      );
    }

    // Update agent status
    await prisma.agent.update({
      where: { id: agentId },
      data: { status: "GENERATING" },
    });

    // Generate title
    const title = await generateAssetTitle(assetType as AssetType, topic);

    // Create placeholder asset record
    const assetRecord = await prisma.knowledgeAsset.create({
      data: {
        title,
        description: `AI-generated ${assetType.replace(/_/g, " ").toLowerCase()} about ${topic}`,
        assetType: assetType as AssetType,
        status: "GENERATING",
        content: "",
        price: price || 20,
        creatorId: agentId,
        tags: [topic.toLowerCase().split(" ")[0], assetType.toLowerCase()],
      },
    });

    // Generate AI content
    const generated = await generateKnowledgeAsset(
      assetType as AssetType,
      topic,
      agent.name,
      agent.type,
      additionalContext
    );

    const contentHash = crypto
      .createHash("sha256")
      .update(generated.content)
      .digest("hex");

    // Upload to 0G Storage
    const storageResult = await uploadKnowledgeAsset({
      id: assetRecord.id,
      title,
      content: generated.content,
      assetType,
      creatorId: agentId,
      metadata: {
        qualityScore: generated.qualityScore,
        tokens: generated.tokens,
        topic,
        generatedAt: new Date().toISOString(),
      },
    });

    // Record ownership on 0G
    const ownershipResult = await recordOwnership({
      assetId: assetRecord.id,
      ownerId: agentId,
      creatorId: agentId,
      price: 0,
      txType: "creation",
    });

    // Update asset with full data
    const updatedAsset = await prisma.knowledgeAsset.update({
      where: { id: assetRecord.id },
      data: {
        content: generated.content,
        contentHash,
        status: "LISTED",
        isListed: true,
        qualityScore: generated.qualityScore,
        storageId: storageResult.storageId,
        storageTxHash: storageResult.txHash,
        rootHash: storageResult.rootHash,
        tags: [
          topic.toLowerCase().split(" ").slice(0, 2).join("-"),
          assetType.toLowerCase().replace(/_/g, "-"),
          agent.type.toLowerCase(),
        ],
      },
      include: {
        creator: true,
      },
    });

    // Add creator as owner
    await prisma.agentAsset.create({
      data: {
        agentId,
        assetId: assetRecord.id,
        pricePaid: 0,
      },
    });

    // Update agent reputation
    const repDelta = 5 + Math.floor(generated.qualityScore / 20);
    const newRep = agent.reputation + repDelta;

    await prisma.agent.update({
      where: { id: agentId },
      data: {
        reputation: newRep,
        status: "IDLE",
      },
    });

    // Persist reputation on 0G
    await persistReputation(agentId, {
      score: newRep,
      delta: repDelta,
      reason: `Created knowledge asset: ${title}`,
      previousScore: agent.reputation,
    });

    // Store memory of this task
    await prisma.agentMemory.create({
      data: {
        agentId,
        content: `I created a ${assetType.replace(/_/g, " ")} titled "${title}" about ${topic}. Quality score: ${generated.qualityScore}/100. The asset was stored on 0G Network with storage ID ${storageResult.storageId?.slice(0, 20)}...`,
        memoryType: "asset_creation",
        importance: 0.8,
        storageId: storageResult.storageId,
        storageTxHash: storageResult.txHash,
        tags: ["asset_creation", assetType.toLowerCase(), topic.toLowerCase()],
      },
    });

    // Log transaction
    await prisma.transaction.create({
      data: {
        type: "ASSET_CREATION",
        senderId: agentId,
        assetId: assetRecord.id,
        description: `Created and stored "${title}" on 0G Network`,
        chainTxHash: storageResult.txHash,
        metadata: {
          storageId: storageResult.storageId,
          rootHash: storageResult.rootHash,
          ownershipTx: ownershipResult.txHash,
          qualityScore: generated.qualityScore,
          size: storageResult.size,
        },
      },
    });

    // Log activity
    await prisma.agentActivity.create({
      data: {
        agentId,
        action: "created_asset",
        description: `Created "${title}" → stored on 0G (${storageResult.storageId?.slice(0, 20)}...)`,
        storageRef: storageResult.storageId,
        metadata: {
          assetId: assetRecord.id,
          assetType,
          qualityScore: generated.qualityScore,
          reputationGained: repDelta,
        },
      },
    });

    // Update marketplace stats
    await prisma.marketplaceStats.upsert({
      where: { id: "singleton" },
      update: {
        totalAssets: { increment: 1 },
        total0GStored: { increment: BigInt(storageResult.size || 0) },
      },
      create: {
        id: "singleton",
        totalAssets: 1,
        total0GStored: BigInt(storageResult.size || 0),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedAsset,
      message: `"${title}" created and stored on 0G Network`,
      zeroG: {
        storageId: storageResult.storageId,
        txHash: storageResult.txHash,
        rootHash: storageResult.rootHash,
        ownershipTx: ownershipResult.txHash,
        size: storageResult.size,
      },
      reputation: {
        previous: agent.reputation,
        gained: repDelta,
        new: newRep,
      },
    });
  } catch (error) {
    console.error("POST /api/assets error:", error);

    // Reset agent status on error
    const body = await req.json().catch(() => ({}));
    if (body.agentId) {
      await prisma.agent
        .update({
          where: { id: body.agentId },
          data: { status: "IDLE" },
        })
        .catch(() => {});
    }

    return NextResponse.json(
      { success: false, error: "Failed to generate asset" },
      { status: 500 }
    );
  }
}
