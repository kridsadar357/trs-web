import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** Create or resume visitor thread */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const visitorKey = typeof body.visitorKey === "string" ? body.visitorKey.trim() : "";
    if (!visitorKey || visitorKey.length < 8) {
      return NextResponse.json({ error: "visitorKey required" }, { status: 400 });
    }

    const visitorName = typeof body.visitorName === "string" ? body.visitorName.trim().slice(0, 255) : null;
    const visitorEmail = typeof body.visitorEmail === "string" ? body.visitorEmail.trim().slice(0, 255) : null;

    const existing = await prisma.chatThread.findFirst({
      where: {
        visitorKey,
        status: { in: ["open", "assigned"] },
      },
      orderBy: { updatedAt: "desc" },
    });

    if (existing) {
      if (visitorName || visitorEmail) {
        await prisma.chatThread.update({
          where: { id: existing.id },
          data: {
            ...(visitorName ? { visitorName } : {}),
            ...(visitorEmail ? { visitorEmail } : {}),
          },
        });
      }
      return NextResponse.json({ threadId: existing.id, status: existing.status });
    }

    const thread = await prisma.chatThread.create({
      data: {
        visitorKey,
        visitorName: visitorName || null,
        visitorEmail: visitorEmail || null,
        status: "open",
      },
    });

    return NextResponse.json({ threadId: thread.id, status: thread.status }, { status: 201 });
  } catch (e) {
    console.error("POST /api/chat/thread", e);
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      const body: Record<string, unknown> = {
        error: "Failed to start chat",
        prismaCode: e.code,
      };
      const meta = e.meta as Record<string, unknown> | undefined;
      if (meta?.table != null) body.table = meta.table;
      if (meta?.modelName != null) body.modelName = meta.modelName;
      if (process.env.NODE_ENV === "development") body.meta = meta;
      return NextResponse.json(body, { status: 500 });
    }
    return NextResponse.json({ error: "Failed to start chat" }, { status: 500 });
  }
}
