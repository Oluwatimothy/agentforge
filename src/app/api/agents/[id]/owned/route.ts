import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (!id || id === "undefined") {
    return NextResponse.json({ success: true, data: [] });
  }

  const owned = await prisma.agentAsset.findMany({
    where: { agentId: id },
    select: { assetId: true },
  });

  return NextResponse.json({
    success: true,
    data: owned.map((o: { assetId: string }) => o.assetId),
  });
}
