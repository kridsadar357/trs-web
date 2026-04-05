import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** Debug DB + env on VPS: open /api/health (do not expose publicly long-term). */
export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { ok: false, reason: "DATABASE_URL is not set (copy .env or use ecosystem.config.cjs)" },
      { status: 503 }
    );
  }
  try {
    await prisma.$queryRaw`SELECT 1`;
    const serviceCount = await prisma.service.count();
    return NextResponse.json({
      ok: true,
      database: true,
      serviceTableCount: serviceCount,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { ok: false, database: false, error: message },
      { status: 503 }
    );
  }
}
