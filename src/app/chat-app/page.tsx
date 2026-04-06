"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { chatAppPath } from "@/lib/chat-app-routes";
import { SupportShell } from "@/components/chat-app/support-shell";

export default function ChatAppHome() {
  const router = useRouter();

  useEffect(() => {
    fetch("/api/chat-support/me", { credentials: "include" })
      .then(async (r) => {
        const j = (await r.json().catch(() => ({}))) as { authenticated?: boolean };
        router.replace(j.authenticated ? chatAppPath("/inbox") : chatAppPath("/login"));
      })
      .catch(() => router.replace(chatAppPath("/login")));
  }, [router]);

  return (
    <SupportShell className="items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-400" />
        <p className="text-xs text-zinc-500">กำลังโหลด…</p>
      </div>
    </SupportShell>
  );
}
