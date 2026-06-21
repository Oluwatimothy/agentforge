import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import {
  recordOwnership,
  persistReputation,
  uploadAgentMemory,
} from "@/lib/0g/storage";

// GET /api/marketplace - Browse listed assets
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const assetType = searchParams.get("assetType");
    const sortBy = searchParams.get("sortBy") || "recent";
    const search = searchParams.get("search");
    const minPrice = parseFloat(searchParams.get("minPrice") || "0");
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "999999");
    const minQuality = parseFloat(searchParams.get("minQuality") || "0");

    const where: Record<string, unknown> = {
      isListed: true,
      status: "LISTED",
      price: { gte: minPrice, lte: maxPrice },
      qualityScore: { gte: minQuality },
    };

    if (assetType) where.assetType = assetType;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const orderByMap: Record<string, unknown> = {
      recent: { createdAt: "desc" },
      price: { price: "desc" },
      quality: { qualityScore: "desc" },
      popular: { viewCount: "desc" },
    };

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
      orderBy: orderByMap[sortBy] || { createdAt: "desc" },
      take: 50,
    });

    // Get stats
    const stats = await prisma.marketplaceStats.findUnique({
      where: { id: "singleton" },
    });

    const agentCount = await prisma.agent.count();
    const volumeResult = await prisma.transaction.aggregate({
      where: { type: "ASSET_PURCHASE" },
      _sum: { amount: true },
    });

    return NextResponse.json({
      success: true,
      data: assets,
      stats: {
        totalAssets: stats?.totalAssets || assets.length,
        totalAgents: agentCount,
        totalVolume: volumeResult._sum.amount || 0,
        totalMemories: stats?.totalMemories || 0,
        total0GStored: stats?.total0GStored?.toString() || "0",
      },
    });
  } catch (error) {
    console.error("GET /api/marketplace error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch marketplace" },
      { status: 500 }
    );
  }
}

// POST /api/marketplace - Purchase an asset
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { buyerAgentId, assetId } = body;

    if (!buyerAgentId || !assetId) {
      return NextResponse.json(
        { success: false, error: "buyerAgentId and assetId required" },
        { status: 400 }
      );
    }

    // Get buyer agent
    const buyer = await prisma.agent.findUnique({
      where: { id: buyerAgentId },
    });
    if (!buyer) {
      return NextResponse.json(
        { success: false, error: "Buyer agent not found" },
        { status: 404 }
      );
    }

    // Get asset
    const asset = await prisma.knowledgeAsset.findUnique({
      where: { id: assetId },
      include: { creator: true },
    });
    if (!asset) {
      return NextResponse.json(
        { success: false, error: "Asset not found" },
        { status: 404 }
      );
    }

    if (!asset.isListed) {
      return NextResponse.json(
        { success: false, error: "Asset is not listed for sale" },
        { status: 400 }
      );
    }

    // Check if already owned
    const existingOwnership = await prisma.agentAsset.findUnique({
      where: { agentId_assetId: { agentId: buyerAgentId, assetId } },
    });
    if (existingOwnership) {
      return NextResponse.json(
        { success: false, error: "Agent already owns this asset" },
        { status: 400 }
      );
    }

    if (asset.creatorId === buyerAgentId) {
      return NextResponse.json(
        { success: false, error: "Cannot purchase your own asset" },
        { status: 400 }
      );
    }

    // Record ownership on 0G Chain
    const ownershipResult = await recordOwnership({
      assetId,
      ownerId: buyerAgentId,
      creatorId: asset.creatorId,
      price: asset.price,
      txType: "purchase",
    });

    // Create ownership record in DB
    await prisma.agentAsset.create({
      data: {
        agentId: buyerAgentId,
        assetId,
        pricePaid: asset.price,
      },
    });

    // Update buyer stats
    const buyerRepDelta = 2;
    const newBuyerRep = buyer.reputation + buyerRepDelta;
    await prisma.agent.update({
      where: { id: buyerAgentId },
      data: {
        totalSpent: { increment: asset.price },
        reputation: newBuyerRep,
      },
    });

    // Update seller stats & reputation
    const sellerRepDelta = 8;
    const seller = asset.creator;
    const newSellerRep = seller.reputation + sellerRepDelta;
    await prisma.agent.update({
      where: { id: asset.creatorId },
      data: {
        totalEarned: { increment: asset.price },
        reputation: newSellerRep,
      },
    });

    // Update asset download count
    await prisma.knowledgeAsset.update({
      where: { id: assetId },
      data: { downloadCount: { increment: 1 } },
    });

    // Persist reputations on 0G
    await persistReputation(buyerAgentId, {
      score: newBuyerRep,
      delta: buyerRepDelta,
      reason: `Purchased asset: ${asset.title}`,
      previousScore: buyer.reputation,
    });

    await persistReputation(asset.creatorId, {
      score: newSellerRep,
      delta: sellerRepDelta,
      reason: `Asset sold: ${asset.title}`,
      previousScore: seller.reputation,
    });

    // Store buyer memory on 0G
    const buyerMemories = await prisma.agentMemory.findMany({
      where: { agentId: buyerAgentId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const newMemoryContent = `I acquired the knowledge asset "${asset.title}" (${asset.assetType}) from ${seller.name} for ${asset.price} credits. This asset is stored on 0G Network with storage ID ${asset.storageId?.slice(0, 20)}...`;

    await prisma.agentMemory.create({
      data: {
        agentId: buyerAgentId,
        content: newMemoryContent,
        memoryType: "asset_acquired",
        importance: 0.7,
        storageId: ownershipResult.storageId,
        storageTxHash: ownershipResult.txHash,
        tags: ["purchase", asset.assetType.toLowerCase(), asset.id],
      },
    });

    // Update buyer's memory on 0G
    await uploadAgentMemory(buyerAgentId, [
      ...buyerMemories,
      { content: newMemoryContent, memoryType: "asset_acquired" },
    ]);

    // Log transaction
    const txRecord = await prisma.transaction.create({
      data: {
        type: "ASSET_PURCHASE",
        senderId: buyerAgentId,
        receiverId: asset.creatorId,
        assetId,
        amount: asset.price,
        description: `${buyer.name} purchased "${asset.title}" from ${seller.name}`,
        chainTxHash: ownershipResult.txHash,
        metadata: {
          ownershipStorageId: ownershipResult.storageId,
          ownershipRootHash: ownershipResult.rootHash,
          assetStorageId: asset.storageId,
        },
      },
    });

    // Log activities for both agents
    await prisma.agentActivity.createMany({
      data: [
        {
          agentId: buyerAgentId,
          action: "purchased_asset",
          description: `Acquired "${asset.title}" from ${seller.name} — ownership recorded on 0G`,
          storageRef: ownershipResult.storageId,
          metadata: { assetId, price: asset.price, txId: txRecord.id },
        },
        {
          agentId: asset.creatorId,
          action: "sold_asset",
          description: `"${asset.title}" sold to ${buyer.name} for ${asset.price} credits`,
          storageRef: ownershipResult.storageId,
          metadata: {
            assetId,
            price: asset.price,
            buyerId: buyerAgentId,
            txId: txRecord.id,
          },
        },
      ],
    });

    // Update marketplace volume
    await prisma.marketplaceStats.upsert({
      where: { id: "singleton" },
      update: { totalVolume: { increment: asset.price } },
      create: { id: "singleton", totalVolume: asset.price },
    });

    return NextResponse.json({
      success: true,
      data: {
        asset,
        transaction: txRecord,
        buyer: { ...buyer, reputation: newBuyerRep },
        seller: { ...seller, reputation: newSellerRep },
      },
      message: `"${asset.title}" purchased! Ownership recorded on 0G Network.`,
      zeroG: {
        ownershipStorageId: ownershipResult.storageId,
        ownershipTxHash: ownershipResult.txHash,
        ownershipRootHash: ownershipResult.rootHash,
      },
      reputation: {
        buyer: { gained: buyerRepDelta, new: newBuyerRep },
        seller: { gained: sellerRepDelta, new: newSellerRep },
      },
    });
  } catch (error) {
    console.error("POST /api/marketplace error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process purchase" },
      { status: 500 }
    );
  }
}
