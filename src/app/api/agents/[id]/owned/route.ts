import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;

    if (!id || id === "undefined") {
      return NextResponse.json({ success: true, data: [] });
    }

    const owned = await prisma.agentAsset.findMany({
      where: { agentId: id },
      select: { assetId: true },
    });

    const assetIds = owned.map((o: { assetId: string }) => o.assetId);

    console.log(`[owned] Agent ${id} owns ${assetIds.length} assets`);

    return NextResponse.json({
      success: true,
      data: assetIds,
    });
  } catch (error) {
    console.error("GET owned error:", error);
    return NextResponse.json({ success: true, data: [] });
  }
}
