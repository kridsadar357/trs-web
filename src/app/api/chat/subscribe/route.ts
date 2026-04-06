import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { chatSubscribe } from "@/lib/chat-bus";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const threadId = request.nextUrl.searchParams.get("threadId") || "";
  const visitorKey = request.nextUrl.searchParams.get("visitorKey") || "";
  if (!threadId || !visitorKey) {
    return new Response("threadId and visitorKey required", { status: 400 });
  }

  const thread = await prisma.chatThread.findFirst({
    where: { id: threadId, visitorKey },
  });
  if (!thread) {
    return new Response("Not found", { status: 404 });
  }

  const encoder = new TextEncoder();
  const stream = new TransformStream<Uint8Array, Uint8Array>();
  const writer = stream.writable.getWriter();

  const send = (obj: unknown) => {
    writer.write(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`)).catch(() => {});
  };

  const unsub = chatSubscribe(threadId, (payload) => {
    send(JSON.parse(payload));
  });

  send({ type: "connected", threadId });

  request.signal.addEventListener("abort", () => {
    unsub();
    writer.close().catch(() => {});
  });

  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
