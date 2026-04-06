import webpush from "web-push";
import { prisma } from "@/lib/prisma";

function openUrlForSub(pathBase: string, threadId: string): string {
  const base = pathBase.trim();
  if (base === "") return `/thread/${threadId}`;
  const prefix = base.startsWith("/") ? base : `/${base}`;
  return `${prefix}/thread/${threadId}`;
}

function configureVapid(): boolean {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:support@localhost";
  if (!publicKey || !privateKey) return false;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  return true;
}

let vapidOk: boolean | null = null;

export function isSupportPushConfigured(): boolean {
  if (vapidOk !== null) return vapidOk;
  vapidOk = Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
  return vapidOk;
}

/** Fire-and-forget from visitor message POST; skips if VAPID not set. */
export async function notifySupportAgentsNewVisitorMessage(params: {
  threadId: string;
  preview: string;
  visitorLabel: string;
  assignedAgentId: string | null;
}): Promise<void> {
  if (!isSupportPushConfigured()) return;
  if (!configureVapid()) return;

  const { threadId, preview, visitorLabel, assignedAgentId } = params;

  const where = assignedAgentId
    ? { agentId: assignedAgentId }
    : { agent: { active: true } };

  const subs = await prisma.supportPushSubscription.findMany({
    where,
    select: { id: true, endpoint: true, p256dh: true, auth: true, pathBase: true },
  });
  if (subs.length === 0) return;

  const title = "ข้อความใหม่จากลูกค้า";
  const body = `${visitorLabel}: ${preview.slice(0, 160)}${preview.length > 160 ? "…" : ""}`;

  await Promise.all(
    subs.map(async (s) => {
      const url = openUrlForSub(s.pathBase, threadId);
      const payload = JSON.stringify({
        title,
        body,
        tag: `thread-${threadId}`,
        url,
        threadId,
      });
      try {
        await webpush.sendNotification(
          {
            endpoint: s.endpoint,
            keys: { p256dh: s.p256dh, auth: s.auth },
          },
          payload,
          { TTL: 3600 }
        );
      } catch (e: unknown) {
        const status = (e as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          await prisma.supportPushSubscription.delete({ where: { id: s.id } }).catch(() => {});
        }
      }
    })
  );
}
