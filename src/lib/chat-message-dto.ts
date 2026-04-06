import type { ChatMessage, SupportAgent } from "@prisma/client";

export type ChatMessageDTO = {
  id: string;
  sender: "visitor" | "agent";
  body: string;
  createdAt: string;
  senderName: string;
  attachmentUrl: string | null;
  attachmentMime: string | null;
  attachmentName: string | null;
  meta: unknown | null;
};

type Row = Pick<
  ChatMessage,
  | "id"
  | "sender"
  | "body"
  | "createdAt"
  | "attachmentUrl"
  | "attachmentMime"
  | "attachmentName"
  | "meta"
> & {
  agent: Pick<SupportAgent, "displayName"> | null;
};

export function toChatMessageDTOs(visitorDisplayName: string | null, rows: Row[]): ChatMessageDTO[] {
  const vName = visitorDisplayName?.trim() || "ลูกค้า";
  return rows.map((m) => ({
    id: m.id,
    sender: m.sender === "agent" ? "agent" : "visitor",
    body: m.body,
    createdAt: m.createdAt.toISOString(),
    senderName: m.sender === "visitor" ? vName : m.agent?.displayName?.trim() || "ทีมซัพพอร์ต",
    attachmentUrl: m.attachmentUrl,
    attachmentMime: m.attachmentMime,
    attachmentName: m.attachmentName,
    meta: m.meta === null ? null : m.meta,
  }));
}

export function dtoFromCreatedVisitorMessage(
  msg: ChatMessage,
  visitorDisplayName: string | null
): ChatMessageDTO {
  const vName = visitorDisplayName?.trim() || "ลูกค้า";
  return {
    id: msg.id,
    sender: "visitor",
    body: msg.body,
    createdAt: msg.createdAt.toISOString(),
    senderName: vName,
    attachmentUrl: msg.attachmentUrl,
    attachmentMime: msg.attachmentMime,
    attachmentName: msg.attachmentName,
    meta: msg.meta === null ? null : msg.meta,
  };
}

export function dtoFromCreatedAgentMessage(msg: ChatMessage, agentDisplayName: string): ChatMessageDTO {
  return {
    id: msg.id,
    sender: "agent",
    body: msg.body,
    createdAt: msg.createdAt.toISOString(),
    senderName: agentDisplayName.trim() || "ทีมซัพพอร์ต",
    attachmentUrl: msg.attachmentUrl,
    attachmentMime: msg.attachmentMime,
    attachmentName: msg.attachmentName,
    meta: msg.meta === null ? null : msg.meta,
  };
}

export function isSafeUploadUrl(url: string): boolean {
  return url.startsWith("/uploads/") && !url.includes("..");
}
