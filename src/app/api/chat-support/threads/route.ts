import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSupportAgentFromCookies } from "@/lib/chat-support-session";

export const dynamic = "force-dynamic";

export async function GET() {
  const agent = await getSupportAgentFromCookies();
  if (!agent) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const threads = await prisma.chatThread.findMany({
      where: {
        OR: [{ status: "open" }, { status: "assigned", assignedAgentId: agent.id }],
      },
      orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { body: true, sender: true, createdAt: true },
        },
        assignedAgent: { select: { displayName: true, username: true } },
      },
    });

    return NextResponse.json(
      threads.map((t) => {
        const last = t.messages[0];
        return {
          id: t.id,
          status: t.status,
          visitorName: t.visitorName,
          visitorEmail: t.visitorEmail,
          lastMessageAt: t.lastMessageAt,
          updatedAt: t.updatedAt,
          assignedTo: t.assignedAgent?.displayName ?? null,
          isMine: t.assignedAgentId === agent.id,
          preview: last?.body?.slice(0, 120) ?? "",
          lastSender: last?.sender ?? null,
          needsReply: last ? last.sender === "visitor" : false,
        };
      })
    );
  } catch (e) {
    console.error("GET /api/chat-support/threads", e);
    return NextResponse.json({ error: "Failed to load threads" }, { status: 500 });
  }
}
