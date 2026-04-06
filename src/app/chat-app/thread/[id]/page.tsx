"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MoreVertical, Copy, Lock, Wifi, WifiOff } from "lucide-react";
import { chatAppPath } from "@/lib/chat-app-routes";
import { useChatAppHref } from "@/lib/use-chat-app-href";
import { cn } from "@/lib/utils";
import type { ChatMessageDTO } from "@/lib/chat-message-dto";
import { ChatMessageBubble } from "@/components/chat/chat-message-bubble";
import { ChatComposer, type ChatSendPayload } from "@/components/chat/chat-composer";
import { SupportShell } from "@/components/chat-app/support-shell";
import { syncSupportAppBadge } from "@/lib/support-app-badge-client";
import { Button } from "@/components/ui/button";

const QUICK_REPLIES = [
  { label: "สวัสดีครับ", body: "สวัสดีครับ ยินดีให้บริการครับ มีอะไรให้ช่วยไหมครับ" },
  { label: "รับทราบ", body: "รับทราบครับ เดี๋ยวดำเนินการให้ครับ" },
  { label: "ขอเวลา", body: "ขอเวลาตรวจสอบสักครู่นะครับ" },
];

type ConnState = "connecting" | "live" | "reconnecting";

export default function SupportThreadPage() {
  const params = useParams();
  const router = useRouter();
  const threadId = typeof params.id === "string" ? params.id : "";
  const inboxHref = useChatAppHref("/inbox");

  const [messages, setMessages] = useState<ChatMessageDTO[]>([]);
  const [visitorTitle, setVisitorTitle] = useState("ลูกค้า");
  const [visitorEmail, setVisitorEmail] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [conn, setConn] = useState<ConnState>("connecting");
  const [closing, setClosing] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const seenIds = useRef(new Set<string>());
  const menuRef = useRef<HTMLDivElement>(null);

  const mergeMessage = useCallback((m: ChatMessageDTO) => {
    if (seenIds.current.has(m.id)) return;
    seenIds.current.add(m.id);
    setMessages((prev) => [...prev, m]);
  }, []);

  const mergeRef = useRef(mergeMessage);
  mergeRef.current = mergeMessage;

  const loadMessages = useCallback(async () => {
    if (!threadId) return;
    const res = await fetch(`/api/chat-support/thread/${threadId}/messages`, {
      credentials: "include",
    });
    if (res.status === 401) {
      router.replace(chatAppPath("/login"));
      return;
    }
    if (!res.ok) return;
    const data = (await res.json()) as {
      messages: ChatMessageDTO[];
      thread?: { visitorName: string | null; visitorEmail: string | null };
    };
    const list = data.messages ?? [];
    seenIds.current = new Set(list.map((m) => m.id));
    setMessages(list);
    const v = data.thread?.visitorName?.trim() || data.thread?.visitorEmail?.trim();
    setVisitorTitle(v || "ลูกค้า");
    setVisitorEmail(data.thread?.visitorEmail?.trim() ?? null);
  }, [threadId, router]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    let cancelled = false;
    async function pollBadge() {
      const r = await fetch("/api/chat-support/pending-count", { credentials: "include" });
      if (!r.ok || cancelled) return;
      const j = (await r.json()) as { count?: number };
      if (typeof j.count === "number") syncSupportAppBadge(j.count);
    }
    void pollBadge();
    const t = setInterval(() => void pollBadge(), 12000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    function onDoc(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  useEffect(() => {
    if (!threadId) return;
    let cancelled = false;
    let es: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let attempt = 0;

    function connect() {
      if (cancelled) return;
      es?.close();
      setConn((c) => (c === "live" ? c : attempt > 0 ? "reconnecting" : "connecting"));
      es = new EventSource(`/api/chat-support/subscribe?threadId=${encodeURIComponent(threadId)}`, {
        withCredentials: true,
      });
      es.onopen = () => {
        attempt = 0;
        setConn("live");
      };
      es.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data) as
            | { type: "connected" }
            | { type: "status"; status: string }
            | { type: "message"; message: ChatMessageDTO };
          if (data.type === "message" && data.message) mergeRef.current(data.message);
          if (data.type === "status" && data.status === "assigned") {
            setBanner("คุณได้รับมอบหมายแชทนี้แล้ว");
            setTimeout(() => setBanner(null), 4000);
          }
          if (data.type === "status" && data.status === "closed") {
            setBanner("เคสนี้ถูกปิดแล้ว");
            router.replace(chatAppPath("/inbox"));
          }
        } catch {
          /* ignore */
        }
      };
      es.onerror = () => {
        es?.close();
        if (cancelled) return;
        setConn("reconnecting");
        attempt += 1;
        const delay = Math.min(2000 * attempt, 12000);
        reconnectTimer = setTimeout(connect, delay);
      };
    }

    connect();
    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      es?.close();
    };
  }, [threadId, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const onSend = useCallback(
    async (payload: ChatSendPayload) => {
      if (!threadId) return;
      const res = await fetch(`/api/chat-support/thread/${threadId}/messages`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: payload.body,
          attachmentUrl: payload.attachmentUrl ?? undefined,
          attachmentMime: payload.attachmentMime ?? undefined,
          attachmentName: payload.attachmentName ?? undefined,
          meta: payload.meta ?? undefined,
        }),
      });
      if (res.status === 401) {
        router.replace(chatAppPath("/login"));
        return;
      }
      if (res.ok) {
        const msg = (await res.json()) as ChatMessageDTO;
        mergeMessage(msg);
        void fetch("/api/chat-support/pending-count", { credentials: "include" })
          .then((r) => (r.ok ? r.json() : null))
          .then((j: { count?: number } | null) => {
            if (j && typeof j.count === "number") syncSupportAppBadge(j.count);
          })
          .catch(() => {});
      }
    },
    [threadId, router, mergeMessage]
  );

  async function copyThreadId() {
    try {
      await navigator.clipboard.writeText(threadId);
      setBanner("คัดลอกรหัสแชทแล้ว");
      setTimeout(() => setBanner(null), 2000);
    } catch {
      setBanner("คัดลอกไม่สำเร็จ");
      setTimeout(() => setBanner(null), 2500);
    }
    setMenuOpen(false);
  }

  async function closeThread() {
    if (!threadId) return;
    if (!window.confirm("ปิดเคสนี้? ลูกค้าจะไม่สามารถสนทนาต่อในห้องนี้ได้")) return;
    setClosing(true);
    try {
      const res = await fetch(`/api/chat-support/thread/${threadId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "closed" }),
      });
      if (res.status === 401) {
        router.replace(chatAppPath("/login"));
        return;
      }
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert((j as { error?: string }).error || "ปิดเคสไม่สำเร็จ");
        return;
      }
      router.replace(chatAppPath("/inbox"));
    } finally {
      setClosing(false);
      setMenuOpen(false);
    }
  }

  return (
    <SupportShell>
      <header className="sticky top-0 z-20 shrink-0 border-b border-white/[0.08] bg-zinc-950/85 backdrop-blur-xl">
        <div className="flex items-start gap-2 px-2 py-2.5">
          <Link
            href={inboxHref}
            aria-label="กลับ"
            className={cn(
              "mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-zinc-400",
              "ring-offset-background transition-all hover:bg-white/5 hover:text-zinc-100",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "active:scale-[0.98]"
            )}
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0 flex-1 pt-0.5">
            <h1 className="truncate text-sm font-semibold text-white">แชท · {visitorTitle}</h1>
            {visitorEmail ? (
              <p className="truncate text-xs text-zinc-500">{visitorEmail}</p>
            ) : (
              <p className="text-xs text-zinc-600">แชทซัพพอร์ต</p>
            )}
          </div>
          <div className="relative flex shrink-0 items-center gap-1" ref={menuRef}>
            <div
              className={cn(
                "mr-1 flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium",
                conn === "live" && "bg-emerald-500/15 text-emerald-300",
                conn === "reconnecting" && "bg-amber-500/15 text-amber-200",
                conn === "connecting" && "bg-zinc-800 text-zinc-400"
              )}
              title="สถานะการเชื่อมต่อแบบเรียลไทม์"
            >
              {conn === "live" ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {conn === "live" ? "Live" : conn === "reconnecting" ? "เชื่อมใหม่" : "…"}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-zinc-400 hover:bg-white/5"
              aria-label="เมนู"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
            {menuOpen ? (
              <div className="absolute right-0 top-full z-30 mt-1 w-48 overflow-hidden rounded-xl border border-white/10 bg-zinc-900/95 py-1 shadow-xl backdrop-blur-md">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-zinc-200 hover:bg-white/5"
                  onClick={() => void copyThreadId()}
                >
                  <Copy className="h-4 w-4 shrink-0 opacity-70" />
                  คัดลอกรหัสแชท
                </button>
                <button
                  type="button"
                  disabled={closing}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                  onClick={() => void closeThread()}
                >
                  <Lock className="h-4 w-4 shrink-0 opacity-70" />
                  {closing ? "กำลังปิด…" : "ปิดเคส"}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>
      {banner ? (
        <div className="shrink-0 border-b border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-center text-xs text-emerald-200">
          {banner}
        </div>
      ) : null}
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
            <p className="text-sm text-zinc-500">ยังไม่มีข้อความในห้องนี้</p>
            <p className="mt-1 text-xs text-zinc-600">พิมพ์ด้านล่างเพื่อเริ่มสนทนา</p>
          </div>
        ) : (
          messages.map((m) => <ChatMessageBubble key={m.id} m={m} perspective="support" />)
        )}
        <div ref={bottomRef} />
      </div>
      <ChatComposer
        variant="support"
        quickReplies={QUICK_REPLIES}
        onSend={onSend}
        className="shrink-0 border-t border-white/8 bg-zinc-950/95"
      />
    </SupportShell>
  );
}
