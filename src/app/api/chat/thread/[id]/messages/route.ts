import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { chatPublish } from "@/lib/chat-bus";
import { dtoFromCreatedVisitorMessage, isSafeUploadUrl, toChatMessageDTOs } from "@/lib/chat-message-dto";
import { notifySupportAgentsNewVisitorMessage } from "@/lib/support-push-notify";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: threadId } = await params;
    const { searchParams } = new URL(request.url);
    const visitorKey = searchParams.get("visitorKey") || "";
    if (!visitorKey) {
      return NextResponse.json({ error: "visitorKey required" }, { status: 400 });
    }

    const thread = await prisma.chatThread.findFirst({
      where: { id: threadId, visitorKey },
    });
    if (!thread) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { threadId },
      orderBy: { createdAt: "asc" },
      include: { agent: { select: { displayName: true } } },
    });

    return NextResponse.json(toChatMessageDTOs(thread.visitorName, messages));
  } catch (e) {
    console.error("GET /api/chat/thread/.../messages", e);
    return NextResponse.json({ error: "Failed to load messages" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: threadId } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const visitorKey = typeof body.visitorKey === "string" ? body.visitorKey.trim() : "";
    const text = typeof body.body === "string" ? body.body.trim() : "";
    const attachmentUrlRaw = typeof body.attachmentUrl === "string" ? body.attachmentUrl.trim() : "";
    const attachmentMime =
      typeof body.attachmentMime === "string" ? body.attachmentMime.trim().slice(0, 128) : null;
    const attachmentName =
      typeof body.attachmentName === "string" ? body.attachmentName.trim().slice(0, 255) : null;

    if (!visitorKey) {
      return NextResponse.json({ error: "visitorKey required" }, { status: 400 });
    }

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

    const thread = await prisma.chatThread.findFirst({
      where: { id: threadId, visitorKey },
    });
    if (!thread || thread.status === "closed") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const bodyText = text || (safeUrl ? `📎 ${attachmentName || "แนบไฟล์"}` : "");

    const msg = await prisma.chatMessage.create({
      data: {
        threadId,
        sender: "visitor",
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

    const dto = dtoFromCreatedVisitorMessage(msg, thread.visitorName);
    chatPublish(threadId, { type: "message", message: dto });

    const visitorLabel =
      thread.visitorName?.trim() || thread.visitorEmail?.trim() || "ลูกค้า";
    void notifySupportAgentsNewVisitorMessage({
      threadId,
      preview: bodyText,
      visitorLabel,
      assignedAgentId: thread.assignedAgentId,
    }).catch(() => {});

    return NextResponse.json(dto, { status: 201 });
  } catch (e) {
    console.error("POST /api/chat/thread/.../messages", e);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
