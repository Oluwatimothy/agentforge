import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { retrieveFromZeroG } from "@/lib/0g/storage";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const asset = await prisma.knowledgeAsset.findUnique({
      where: { id: params.id },
      include: {
        creator: true,
        owners: {
          include: {
            agent: { select: { id: true, name: true, type: true } },
          },
        },
        transactions: {
          include: {
            sender: { select: { id: true, name: true } },
            receiver: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!asset) {
      return NextResponse.json(
        { success: false, error: "Asset not found" },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.knowledgeAsset.update({
      where: { id: params.id },
      data: { viewCount: { increment: 1 } },
    });

    // Optionally verify content from 0G
    const { searchParams } = new URL(req.url);
    const verify = searchParams.get("verify") === "true";

    let verified = false;
    if (verify && asset.rootHash) {
      const stored = await retrieveFromZeroG(asset.rootHash);
      if (stored.success && stored.data) {
        try {
          const storedAsset = JSON.parse(stored.data);
          verified = storedAsset.contentHash === asset.contentHash;
        } catch {
          verified = false;
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: asset,
      verified,
    });
  } catch (error) {
    console.error("GET /api/assets/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch asset" },
      { status: 500 }
    );
  }
}
