/**
 * Chat PWA URLs: on chats.* subdomain use /inbox; on main host use /chat-app/inbox.
 * Safe on server (treats as main host) and client.
 */
export function chatAppPath(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  const onChat =
    typeof window !== "undefined" && window.location.hostname.toLowerCase().startsWith("chats.");
  if (onChat) {
    if (p === "/chat-app" || p === "/") return "/";
    return p.startsWith("/chat-app/") ? p.slice("/chat-app".length) || "/" : p;
  }
  if (p === "/" || p === "/chat-app") return "/chat-app";
  if (p.startsWith("/chat-app")) return p;
  return `/chat-app${p}`;
}
