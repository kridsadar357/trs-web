import { NextResponse } from "next/server";
import { getSupportAgentFromCookies } from "@/lib/chat-support-session";
import { getPendingReplyCountForAgent } from "@/lib/support-pending-reply-count";

export const dynamic = "force-dynamic";

export async function GET() {
  const agent = await getSupportAgentFromCookies();
  if (!agent) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const count = await getPendingReplyCountForAgent(agent.id);
    return NextResponse.json({ count });
  } catch (e) {
    console.error("GET /api/chat-support/pending-count", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
