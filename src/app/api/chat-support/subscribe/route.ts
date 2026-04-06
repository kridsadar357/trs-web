import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { chatSubscribe } from "@/lib/chat-bus";
import { getSupportAgentFromCookies } from "@/lib/chat-support-session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const agent = await getSupportAgentFromCookies();
  if (!agent) {
    return new Response("Unauthorized", { status: 401 });
  }

  const threadId = request.nextUrl.searchParams.get("threadId") || "";
  if (!threadId) {
    return new Response("threadId required", { status: 400 });
  }

  const thread = await prisma.chatThread.findUnique({ where: { id: threadId } });
  if (!thread || thread.status === "closed") {
    return new Response("Not found", { status: 404 });
  }
  const canSubscribe =
    thread.status === "open" ||
    !thread.assignedAgentId ||
    thread.assignedAgentId === agent.id;
  if (!canSubscribe) {
    return new Response("Forbidden", { status: 403 });
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
