import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSupportAgentFromCookies } from "@/lib/chat-support-session";

export const dynamic = "force-dynamic";

type Body = {
  subscription?: {
    endpoint?: string;
    keys?: { p256dh?: string; auth?: string };
  };
  pathBase?: string;
};

export async function POST(request: Request) {
  const agent = await getSupportAgentFromCookies();
  if (!agent) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const sub = body.subscription;
  const endpoint = typeof sub?.endpoint === "string" ? sub.endpoint.trim() : "";
  const p256dh = typeof sub?.keys?.p256dh === "string" ? sub.keys.p256dh.trim() : "";
  const auth = typeof sub?.keys?.auth === "string" ? sub.keys.auth.trim() : "";
  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  }

  let pathBase = typeof body.pathBase === "string" ? body.pathBase.trim().slice(0, 64) : "/chat-app";
  if (pathBase !== "" && pathBase !== "/chat-app") {
    pathBase = "/chat-app";
  }

  const ua = request.headers.get("user-agent")?.slice(0, 512) ?? null;

  try {
    await prisma.supportPushSubscription.upsert({
      where: { endpoint },
      create: {
        agentId: agent.id,
        endpoint,
        p256dh,
        auth,
        pathBase,
        userAgent: ua,
      },
      update: {
        agentId: agent.id,
        p256dh,
        auth,
        pathBase,
        userAgent: ua,
        updatedAt: new Date(),
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("push subscribe", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
