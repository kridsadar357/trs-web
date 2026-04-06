import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSupportAgentFromCookies } from "@/lib/chat-support-session";
import { chatPublish } from "@/lib/chat-bus";

export const dynamic = "force-dynamic";

/** Close thread (assigned agent, or any agent if still unassigned open). */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const agent = await getSupportAgentFromCookies();
  if (!agent) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: threadId } = await params;
    const body = (await request.json()) as { status?: string };
    if (body.status !== "closed") {
      return NextResponse.json({ error: "Only status closed supported" }, { status: 400 });
    }

    const thread = await prisma.chatThread.findUnique({ where: { id: threadId } });
    if (!thread) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (thread.status === "closed") {
      return NextResponse.json({ error: "Already closed" }, { status: 400 });
    }

    if (thread.assignedAgentId && thread.assignedAgentId !== agent.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.chatThread.update({
      where: { id: threadId },
      data: { status: "closed", updatedAt: new Date() },
    });

    chatPublish(threadId, { type: "status", status: "closed" });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("PATCH chat-support thread", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
