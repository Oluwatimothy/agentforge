import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!params.id) {
      return NextResponse.json({ success: true, data: [] });
    }

    const owned = await prisma.agentAsset.findMany({
      where: { agentId: params.id },
      select: { assetId: true },
    });

    return NextResponse.json({
      success: true,
      data: owned.map((o) => o.assetId),
    });
  } catch (error) {
    console.error("GET owned error:", error);
    return NextResponse.json({ success: true, data: [] });
  }
}
