"use client";

import { useEffect, useState } from "react";
import { chatAppPath } from "@/lib/chat-app-routes";

/** Correct href after mount (avoids SSR / subdomain mismatch for `<Link>`). */
export function useChatAppHref(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const defaultMain = normalized.startsWith("/chat-app")
    ? normalized
    : `/chat-app${normalized === "/" ? "" : normalized}`;
  const [href, setHref] = useState(defaultMain);
  useEffect(() => {
    setHref(chatAppPath(normalized));
  }, [normalized]);
  return href;
}
