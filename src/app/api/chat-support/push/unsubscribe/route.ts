import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSupportAgentFromCookies } from "@/lib/chat-support-session";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const agent = await getSupportAgentFromCookies();
  if (!agent) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { endpoint?: string };
  try {
    body = (await request.json()) as { endpoint?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const endpoint = typeof body.endpoint === "string" ? body.endpoint.trim() : "";
  if (!endpoint) {
    return NextResponse.json({ error: "endpoint required" }, { status: 400 });
  }

  try {
    await prisma.supportPushSubscription.deleteMany({
      where: { endpoint, agentId: agent.id },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("push unsubscribe", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
