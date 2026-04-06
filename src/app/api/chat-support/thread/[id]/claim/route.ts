import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSupportAgentFromCookies } from "@/lib/chat-support-session";
import { chatPublish } from "@/lib/chat-bus";

export const dynamic = "force-dynamic";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const agent = await getSupportAgentFromCookies();
  if (!agent) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: threadId } = await params;
    const thread = await prisma.chatThread.findUnique({ where: { id: threadId } });
    if (!thread || thread.status === "closed") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (thread.status === "assigned" && thread.assignedAgentId && thread.assignedAgentId !== agent.id) {
      return NextResponse.json({ error: "Already assigned" }, { status: 409 });
    }

    const updated = await prisma.chatThread.update({
      where: { id: threadId },
      data: { status: "assigned", assignedAgentId: agent.id },
    });

    chatPublish(threadId, { type: "status", status: updated.status });

    return NextResponse.json({ ok: true, thread: updated });
  } catch (e) {
    console.error("POST claim", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
