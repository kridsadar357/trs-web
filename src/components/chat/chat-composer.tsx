"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, X, Send, ImageIcon, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { buildQuotationMessage, type QuotationServiceItem } from "@/lib/chat-quotation";

export type ChatSendPayload = {
  body: string;
  attachmentUrl?: string | null;
  attachmentMime?: string | null;
  attachmentName?: string | null;
  meta?: Record<string, unknown> | null;
};

type ServiceRow = { id: string; title: string };

type QuickReply = { label: string; body: string };

type Props = {
  onSend: (payload: ChatSendPayload) => Promise<void>;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  /** Support agents: hide visitor-only quotation flow; menu is attach-only. */
  variant?: "visitor" | "support";
  quickReplies?: QuickReply[];
};

export function ChatComposer({
  onSend,
  disabled,
  className,
  inputClassName,
  variant = "visitor",
  quickReplies,
}: Props) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [quotePhone, setQuotePhone] = useState("");
  const [quoteNote, setQuoteNote] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const busy = disabled || sending;

  useEffect(() => {
    if (!menuOpen) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  const uploadFile = useCallback(async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      throw new Error((j as { error?: string }).error || "อัปโหลดไม่สำเร็จ");
    }
    return (await res.json()) as { url: string; mime: string; originalName: string };
  }, []);

  const sendPayload = useCallback(
    async (payload: ChatSendPayload) => {
      setSending(true);
      try {
        await onSend(payload);
      } finally {
        setSending(false);
      }
    },
    [onSend]
  );

  async function sendText() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    await sendPayload({ body: text });
  }

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || busy) return;
    setMenuOpen(false);
    try {
      const up = await uploadFile(file);
      await sendPayload({
        body: input.trim(),
        attachmentUrl: up.url,
        attachmentMime: up.mime,
        attachmentName: up.originalName,
      });
      setInput("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ");
    }
  }

  const isSupport = variant === "support";

  async function openQuotation() {
    if (isSupport) return;
    setMenuOpen(false);
    setQuoteOpen(true);
    setLoadingServices(true);
    try {
      const res = await fetch("/api/services");
      const list = (await res.json()) as ServiceRow[];
      setServices(Array.isArray(list) ? list.map((s) => ({ id: s.id, title: s.title })) : []);
    } catch {
      setServices([]);
    } finally {
      setLoadingServices(false);
    }
  }

  function toggleService(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function submitQuotation() {
    const items: QuotationServiceItem[] = services.filter((s) => selected.has(s.id)).map((s) => ({
      id: s.id,
      title: s.title,
    }));
    if (items.length === 0) {
      alert("เลือกบริการอย่างน้อย 1 รายการ");
      return;
    }
    const { body, meta } = buildQuotationMessage(items, quotePhone, quoteNote);
    setQuoteOpen(false);
    setSelected(new Set());
    setQuotePhone("");
    setQuoteNote("");
    await sendPayload({ body, meta });
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      {!isSupport && quoteOpen ? (
        <div className="absolute bottom-full left-0 right-0 mb-1 z-20 max-h-64 overflow-hidden rounded-lg border bg-background shadow-lg flex flex-col">
          <div className="flex items-center justify-between border-b px-2 py-1.5">
            <span className="text-xs font-medium">ขอใบเสนอราคา</span>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => setQuoteOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-2 space-y-2 overflow-y-auto min-h-0 flex-1">
            {loadingServices ? (
              <p className="text-xs text-muted-foreground py-4 text-center">กำลังโหลดบริการ…</p>
            ) : services.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">ยังไม่มีรายการบริการ</p>
            ) : (
              <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                {services.map((s) => (
                  <label
                    key={s.id}
                    className="flex items-start gap-2 text-xs rounded-md border border-border/60 px-2 py-1.5 cursor-pointer hover:bg-muted/50"
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(s.id)}
                      onChange={() => toggleService(s.id)}
                      className="mt-0.5"
                    />
                    <span>{s.title}</span>
                  </label>
                ))}
              </div>
            )}
            <div className="space-y-1">
              <Label className="text-xs">เบอร์โทร (ไม่บังคับ)</Label>
              <Input
                value={quotePhone}
                onChange={(e) => setQuotePhone(e.target.value)}
                className="h-8 text-xs"
                placeholder="081-xxx-xxxx"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">หมายเหตุ (ไม่บังคับ)</Label>
              <Input
                value={quoteNote}
                onChange={(e) => setQuoteNote(e.target.value)}
                className="h-8 text-xs"
                placeholder="รายละเอียดเพิ่มเติม"
              />
            </div>
            <Button type="button" size="sm" className="w-full" disabled={busy} onClick={() => void submitQuotation()}>
              ส่งคำขอใบเสนอราคา
            </Button>
          </div>
        </div>
      ) : null}

      {menuOpen && !quoteOpen ? (
        <div className="absolute bottom-full left-0 mb-1 z-20 w-48 rounded-xl border border-border bg-popover py-1 text-popover-foreground shadow-lg">
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-muted"
            onClick={() => {
              fileRef.current?.click();
            }}
          >
            <ImageIcon className="h-4 w-4 shrink-0" />
            รูปภาพ / ไฟล์
          </button>
          {!isSupport ? (
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-muted"
              onClick={() => void openQuotation()}
            >
              <ClipboardList className="h-4 w-4 shrink-0" />
              ขอใบเสนอราคา
            </button>
          ) : null}
        </div>
      ) : null}

      <input
        ref={fileRef}
        type="file"
        className="hidden"
        accept="image/jpeg,image/png,image/gif,image/webp,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
        onChange={(e) => void onPickFile(e)}
      />

      {isSupport && quickReplies && quickReplies.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 border-t border-white/5 bg-zinc-950/80 px-2 py-2">
          {quickReplies.map((q) => (
            <button
              key={q.label}
              type="button"
              disabled={busy}
              onClick={() =>
                setInput((s) => {
                  const t = s.trim();
                  return t ? `${t}\n${q.body}` : q.body;
                })
              }
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-zinc-200 transition hover:bg-white/10 disabled:opacity-50"
            >
              {q.label}
            </button>
          ))}
        </div>
      ) : null}

      <div
        className={cn(
          "flex gap-1.5 items-center border-t p-2",
          isSupport ? "border-white/8 bg-zinc-950/90" : "border-border bg-background"
        )}
      >
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={cn(
            "h-9 w-9 shrink-0",
            isSupport && "border-white/15 bg-white/5 hover:bg-white/10 text-zinc-100"
          )}
          disabled={busy}
          aria-label="เพิ่ม"
          onClick={() => {
            if (isSupport) {
              fileRef.current?.click();
              return;
            }
            setMenuOpen((o) => !o);
            setQuoteOpen(false);
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isSupport ? "ตอบลูกค้า…" : "พิมพ์ข้อความ…"}
          className={cn(
            "text-sm flex-1",
            isSupport && "border-white/10 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500",
            inputClassName
          )}
          disabled={busy}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void sendText();
            }
          }}
        />
        <Button
          type="button"
          size="sm"
          className={cn("shrink-0 gap-1", isSupport && "shadow-lg shadow-emerald-500/20")}
          disabled={busy || !input.trim()}
          onClick={() => void sendText()}
        >
          <Send className="h-3.5 w-3.5" />
          ส่ง
        </Button>
      </div>
    </div>
  );
}
