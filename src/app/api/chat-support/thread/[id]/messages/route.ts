import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSupportAgentFromCookies } from "@/lib/chat-support-session";
import { chatPublish } from "@/lib/chat-bus";
import { dtoFromCreatedAgentMessage, isSafeUploadUrl, toChatMessageDTOs } from "@/lib/chat-message-dto";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
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
    const canRead =
      thread.status === "open" || !thread.assignedAgentId || thread.assignedAgentId === agent.id;
    if (!canRead) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { threadId },
      orderBy: { createdAt: "asc" },
      include: { agent: { select: { displayName: true } } },
    });

    return NextResponse.json({
      thread: {
        visitorName: thread.visitorName,
        visitorEmail: thread.visitorEmail,
      },
      messages: toChatMessageDTOs(thread.visitorName, messages),
    });
  } catch (e) {
    console.error("GET support messages", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const agent = await getSupportAgentFromCookies();
  if (!agent) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: threadId } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const text = typeof body.body === "string" ? body.body.trim() : "";
    const attachmentUrlRaw = typeof body.attachmentUrl === "string" ? body.attachmentUrl.trim() : "";
    const attachmentMime =
      typeof body.attachmentMime === "string" ? body.attachmentMime.trim().slice(0, 128) : null;
    const attachmentName =
      typeof body.attachmentName === "string" ? body.attachmentName.trim().slice(0, 255) : null;

    let safeUrl: string | null = null;
    if (attachmentUrlRaw) {
      if (!isSafeUploadUrl(attachmentUrlRaw)) {
        return NextResponse.json({ error: "Invalid attachment" }, { status: 400 });
      }
      safeUrl = attachmentUrlRaw;
    }

    let meta: Prisma.InputJsonValue | undefined;
    if (body.meta !== undefined && body.meta !== null) {
      if (typeof body.meta !== "object" || Array.isArray(body.meta)) {
        return NextResponse.json({ error: "Invalid meta" }, { status: 400 });
      }
      meta = body.meta as Prisma.InputJsonValue;
    }

    if (!text && !safeUrl) {
      return NextResponse.json({ error: "message or attachment required" }, { status: 400 });
    }

    let thread = await prisma.chatThread.findUnique({ where: { id: threadId } });
    if (!thread || thread.status === "closed") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (thread.status === "open" || !thread.assignedAgentId) {
      thread = await prisma.chatThread.update({
        where: { id: threadId },
        data: { status: "assigned", assignedAgentId: agent.id },
      });
      chatPublish(threadId, { type: "status", status: "assigned" });
    } else if (thread.assignedAgentId !== agent.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const bodyText = text || (safeUrl ? `📎 ${attachmentName || "แนบไฟล์"}` : "");

    const msg = await prisma.chatMessage.create({
      data: {
        threadId,
        sender: "agent",
        agentId: agent.id,
        body: bodyText.slice(0, 8000),
        attachmentUrl: safeUrl,
        attachmentMime: safeUrl ? attachmentMime || "application/octet-stream" : null,
        attachmentName: safeUrl ? attachmentName : null,
        ...(meta !== undefined ? { meta } : {}),
      },
    });

    await prisma.chatThread.update({
      where: { id: threadId },
      data: { lastMessageAt: msg.createdAt, updatedAt: new Date() },
    });

    const dto = dtoFromCreatedAgentMessage(msg, agent.displayName);
    chatPublish(threadId, { type: "message", message: dto });

    return NextResponse.json(dto, { status: 201 });
  } catch (e) {
    console.error("POST support message", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
