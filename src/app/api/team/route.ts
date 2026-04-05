import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const members = await prisma.teamMember.findMany({
      where: { published: true },
      orderBy: { order: "asc" },
    });
    return NextResponse.json(members);
  } catch (e) {
    console.error("GET /api/team", e);
    return NextResponse.json([]);
  }
}
