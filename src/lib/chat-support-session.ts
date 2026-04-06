import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { COOKIE_NAME, verifySupportAgentToken } from "@/lib/chat-support-jwt";

export async function getSupportAgentFromCookies() {
  const jar = await cookies();
  const raw = jar.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  const agentId = await verifySupportAgentToken(raw);
  if (!agentId) return null;
  const agent = await prisma.supportAgent.findFirst({
    where: { id: agentId, active: true },
  });
  return agent;
}
