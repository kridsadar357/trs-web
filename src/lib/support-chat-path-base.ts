/** Path prefix for support UI: nested on main site vs root on chats.* */
export function getSupportChatPathBase(): string {
  if (typeof window === "undefined") return "/chat-app";
  const h = window.location.hostname.toLowerCase();
  if (h.startsWith("chats.")) return "";
  return "/chat-app";
}

export function supportThreadUrlPath(threadId: string): string {
  const base = getSupportChatPathBase();
  return `${base}/thread/${threadId}`;
}
