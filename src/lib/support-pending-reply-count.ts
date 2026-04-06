import { prisma } from "@/lib/prisma";

/** Matches inbox "รอตอบ": last message in thread is from visitor. */
export async function getPendingReplyCountForAgent(agentId: string): Promise<number> {
  const threads = await prisma.chatThread.findMany({
    where: {
      OR: [{ status: "open" }, { status: "assigned", assignedAgentId: agentId }],
    },
    select: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { sender: true },
      },
    },
  });
  return threads.filter((t) => t.messages[0]?.sender === "visitor").length;
}
