import { NextResponse } from "next/server";
import { getSupportAgentFromCookies } from "@/lib/chat-support-session";

export const dynamic = "force-dynamic";

export async function GET() {
  const agent = await getSupportAgentFromCookies();
  if (!agent) {
    return NextResponse.json({ authenticated: false });
  }
  return NextResponse.json({
    authenticated: true,
    id: agent.id,
    username: agent.username,
    displayName: agent.displayName,
  });
}
