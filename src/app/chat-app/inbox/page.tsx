"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, RefreshCw, Inbox, Clock, User } from "lucide-react";
import { chatAppPath } from "@/lib/chat-app-routes";
import { useChatAppHref } from "@/lib/use-chat-app-href";
import { formatRelativeTh } from "@/lib/format-relative-th";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SupportShell } from "@/components/chat-app/support-shell";
import { cn } from "@/lib/utils";

type Row = {
  id: string;
  status: string;
  visitorName: string | null;
  visitorEmail: string | null;
  lastMessageAt: string | null;
  updatedAt: string;
  preview: string;
  isMine: boolean;
  assignedTo: string | null;
  needsReply?: boolean;
  lastSender?: string | null;
};

type Filter = "all" | "pending" | "mine";

function InboxThreadLink({ id, children }: { id: string; children: React.ReactNode }) {
  const href = useChatAppHref(`/thread/${id}`);
  return (
    <Link
      href={href}
      className="block px-4 py-3.5 transition-colors hover:bg-white/[0.04] active:bg-white/[0.06]"
    >
      {children}
    </Link>
  );
}

function InboxSkeleton() {
  return (
    <ul className="divide-y divide-white/[0.06]">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="px-4 py-4">
          <div className="flex justify-between gap-2">
            <div className="h-4 w-36 animate-pulse rounded bg-zinc-800" />
            <div className="h-3 w-14 animate-pulse rounded bg-zinc-800" />
          </div>
          <div className="mt-2 h-3 w-full max-w-[90%] animate-pulse rounded bg-zinc-800/70" />
          <div className="mt-1.5 h-3 w-2/3 animate-pulse rounded bg-zinc-800/50" />
        </li>
      ))}
    </ul>
  );
}

export default function ChatInboxPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [me, setMe] = useState<{ displayName: string; username: string } | null>(null);

  const load = useCallback(async (isManual?: boolean) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch("/api/chat-support/threads", { credentials: "include" });
      if (res.status === 401) {
        router.replace(chatAppPath("/login"));
        return;
      }
      if (!res.ok) return;
      setRows(await res.json());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
    const t = setInterval(() => void load(), 12000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    fetch("/api/chat-support/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j?.displayName) setMe({ displayName: j.displayName, username: j.username });
      })
      .catch(() => {});
  }, []);

  async function logout() {
    await fetch("/api/chat-support/logout", { method: "POST", credentials: "include" });
    router.replace(chatAppPath("/login"));
  }

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filter === "pending") return Boolean(r.needsReply);
      if (filter === "mine") return r.isMine;
      return true;
    });
  }, [rows, filter]);

  const pendingCount = useMemo(() => rows.filter((r) => r.needsReply).length, [rows]);

  if (loading) {
    return (
      <SupportShell>
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-3.5">
          <div className="h-5 w-32 animate-pulse rounded bg-zinc-800" />
          <div className="h-9 w-16 animate-pulse rounded-md bg-zinc-800" />
        </header>
        <InboxSkeleton />
      </SupportShell>
    );
  }

  return (
    <SupportShell>
      <header className="sticky top-0 z-20 shrink-0 border-b border-white/[0.08] bg-zinc-950/80 px-3 py-3 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-2 px-1">
          <div>
            <h1 className="text-base font-semibold tracking-tight text-white">แชทลูกค้า</h1>
            <p className="text-[11px] text-zinc-500">อัปเดตอัตโนมัติทุก 12 วินาที</p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
              aria-label="รีเฟรช"
              disabled={refreshing}
              onClick={() => void load(true)}
            >
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 border-white/15 bg-white/5 text-zinc-200 hover:bg-white/10"
              onClick={() => void logout()}
            >
              <LogOut className="mr-1.5 h-3.5 w-3.5" />
              ออก
            </Button>
          </div>
        </div>
        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {(
            [
              { key: "all" as const, label: "ทั้งหมด", icon: Inbox },
              { key: "pending" as const, label: "รอตอบ", icon: Clock },
              { key: "mine" as const, label: "ของฉัน", icon: User },
            ] as const
          ).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition",
                filter === key
                  ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40"
                  : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
              )}
            >
              <Icon className="h-3.5 w-3.5 opacity-80" />
              {label}
              {key === "pending" && pendingCount > 0 ? (
                <span className="ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500/25 px-1 text-[10px] font-bold text-amber-200">
                  {pendingCount > 99 ? "99+" : pendingCount}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </header>

      <ul className="min-h-0 flex-1 divide-y divide-white/[0.06] overflow-y-auto">
        {filtered.length === 0 ? (
          <li className="px-6 py-16 text-center">
            <p className="text-sm text-zinc-400">
              {rows.length === 0 ? "ยังไม่มีแชทในคิว" : "ไม่มีรายการในตัวกรองนี้"}
            </p>
          </li>
        ) : (
          filtered.map((r) => (
            <li key={r.id} className="relative">
              {r.needsReply ? (
                <span
                  className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full bg-amber-400/90"
                  aria-hidden
                />
              ) : null}
              <InboxThreadLink id={r.id}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-medium text-zinc-100">
                        {r.visitorName || r.visitorEmail || "ลูกค้า"}
                      </span>
                      {r.needsReply ? (
                        <Badge className="border-0 bg-amber-500/20 text-[10px] font-semibold uppercase tracking-wide text-amber-200">
                          รอตอบ
                        </Badge>
                      ) : null}
                    </div>
                    {r.visitorEmail && r.visitorName ? (
                      <p className="mt-0.5 truncate text-xs text-zinc-500">{r.visitorEmail}</p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-[11px] text-zinc-500">
                      {formatRelativeTh(r.lastMessageAt || r.updatedAt)}
                    </span>
                    <span className="text-[10px] font-medium text-zinc-500">
                      {r.status === "open" ? "รอรับ" : r.isMine ? "ของฉัน" : r.assignedTo ? "มีคนดูแล" : "—"}
                    </span>
                  </div>
                </div>
                {r.preview ? (
                  <p className="mt-2 line-clamp-2 text-sm leading-snug text-zinc-400">{r.preview}</p>
                ) : (
                  <p className="mt-2 text-sm italic text-zinc-600">ยังไม่มีข้อความ</p>
                )}
              </InboxThreadLink>
            </li>
          ))
        )}
      </ul>

      {me ? (
        <footer className="shrink-0 border-t border-white/[0.08] bg-zinc-950/90 px-4 py-3 backdrop-blur-md">
          <p className="text-center text-[11px] text-zinc-500">
            ลงชื่อเข้าใช้เป็น{" "}
            <span className="font-medium text-zinc-300">{me.displayName}</span>
            <span className="text-zinc-600"> · {me.username}</span>
          </p>
        </footer>
      ) : null}
    </SupportShell>
  );
}
