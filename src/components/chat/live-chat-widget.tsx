"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ChatMessageDTO } from "@/lib/chat-message-dto";
import { ChatMessageBubble } from "@/components/chat/chat-message-bubble";
import { ChatComposer, type ChatSendPayload } from "@/components/chat/chat-composer";

const STORAGE_KEY = "trs_chat_visitor_key";

function getVisitorKey(): string {
  if (typeof window === "undefined") return "";
  let k = localStorage.getItem(STORAGE_KEY);
  if (!k || k.length < 8) {
    k = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "").slice(0, 12);
    localStorage.setItem(STORAGE_KEY, k);
  }
  return k;
}

export function LiveChatWidget() {
  const [open, setOpen] = useState(false);
  const [started, setStarted] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [visitorName, setVisitorName] = useState("");
  const [visitorEmail, setVisitorEmail] = useState("");
  const [messages, setMessages] = useState<ChatMessageDTO[]>([]);
  const [starting, setStarting] = useState(false);
  const [statusNote, setStatusNote] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const seenIds = useRef(new Set<string>());

  const mergeMessage = useCallback((m: ChatMessageDTO) => {
    if (seenIds.current.has(m.id)) return;
    seenIds.current.add(m.id);
    setMessages((prev) => [...prev, m]);
  }, []);

  const startThread = useCallback(async () => {
    setStarting(true);
    setStatusNote(null);
    try {
      const visitorKey = getVisitorKey();
      const res = await fetch("/api/chat/thread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorKey,
          visitorName: visitorName.trim() || null,
          visitorEmail: visitorEmail.trim() || null,
        }),
      });
      if (!res.ok) return;
      const j = (await res.json()) as { threadId: string };
      setThreadId(j.threadId);
      setStarted(true);

      const msgRes = await fetch(
        `/api/chat/thread/${j.threadId}/messages?visitorKey=${encodeURIComponent(visitorKey)}`
      );
      if (msgRes.ok) {
        const list = (await msgRes.json()) as ChatMessageDTO[];
        seenIds.current = new Set(list.map((m) => m.id));
        setMessages(list);
      }
    } finally {
      setStarting(false);
    }
  }, [visitorName, visitorEmail]);

  useEffect(() => {
    if (!open || !started || !threadId) return;
    const visitorKey = getVisitorKey();
    const es = new EventSource(
      `/api/chat/subscribe?threadId=${encodeURIComponent(threadId)}&visitorKey=${encodeURIComponent(visitorKey)}`
    );
    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data) as
          | { type: "connected" }
          | { type: "status"; status: string }
          | { type: "message"; message: ChatMessageDTO };
        if (data.type === "message" && data.message) mergeMessage(data.message);
        if (data.type === "status" && data.status === "assigned") {
          setStatusNote("เจ้าหน้าที่กำลังตอบคุณ");
        }
      } catch {
        /* ignore */
      }
    };
    es.onerror = () => es.close();
    return () => es.close();
  }, [open, started, threadId, mergeMessage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, open]);

  const onSend = useCallback(
    async (payload: ChatSendPayload) => {
      const visitorKey = getVisitorKey();
      if (!threadId) return;
      const res = await fetch(`/api/chat/thread/${threadId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorKey,
          body: payload.body,
          attachmentUrl: payload.attachmentUrl ?? undefined,
          attachmentMime: payload.attachmentMime ?? undefined,
          attachmentName: payload.attachmentName ?? undefined,
          meta: payload.meta ?? undefined,
        }),
      });
      if (res.ok) {
        const msg = (await res.json()) as ChatMessageDTO;
        mergeMessage(msg);
      }
    },
    [threadId, mergeMessage]
  );

  return (
    <>
      <button
        type="button"
        aria-label="เปิดแชท"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition hover:scale-105"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-7 w-7" />}
      </button>

      {open ? (
        <div className="fixed bottom-24 right-5 z-50 flex h-[min(72vh,34rem)] w-[min(100vw-2.5rem,22rem)] flex-col overflow-hidden rounded-xl border bg-background shadow-2xl">
          <div className="border-b px-4 py-3 shrink-0">
            <p className="font-semibold text-sm">แชทกับเรา</p>
            <p className="text-xs text-muted-foreground">ตอบกลับโดยทีม TRS</p>
          </div>

          {!started ? (
            <div className="p-4 space-y-3 overflow-y-auto">
              <div className="space-y-1">
                <Label htmlFor="lc-name">ชื่อ (ไม่บังคับ)</Label>
                <Input
                  id="lc-name"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  placeholder="ชื่อของคุณ"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lc-email">อีเมล (ไม่บังคับ)</Label>
                <Input
                  id="lc-email"
                  type="email"
                  value={visitorEmail}
                  onChange={(e) => setVisitorEmail(e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
              <Button className="w-full" disabled={starting} onClick={() => void startThread()}>
                {starting ? "กำลังเริ่มแชท…" : "เริ่มแชท"}
              </Button>
            </div>
          ) : (
            <>
              <div className="min-h-0 flex-1 overflow-y-auto p-3 space-y-2">
                {statusNote ? (
                  <p className="text-center text-xs text-primary bg-primary/10 rounded-md py-2 px-2">{statusNote}</p>
                ) : null}
                {messages.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8">ส่งข้อความหรือแนบไฟล์เพื่อเริ่มสนทนา</p>
                ) : (
                  messages.map((m) => <ChatMessageBubble key={m.id} m={m} perspective="visitor" />)
                )}
                <div ref={bottomRef} />
              </div>
              <ChatComposer onSend={onSend} className="shrink-0" />
            </>
          )}
        </div>
      ) : null}
    </>
  );
}
