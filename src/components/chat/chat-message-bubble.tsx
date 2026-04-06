"use client";

import { cn } from "@/lib/utils";
import type { ChatMessageDTO } from "@/lib/chat-message-dto";
import { FileText } from "lucide-react";

type Perspective = "visitor" | "support";

export function ChatMessageBubble({ m, perspective }: { m: ChatMessageDTO; perspective: Perspective }) {
  const isVisitor = m.sender === "visitor";
  const mine = perspective === "visitor" ? isVisitor : !isVisitor;
  const meta = m.meta && typeof m.meta === "object" ? (m.meta as { quotation?: boolean }) : null;
  const isQuotation = Boolean(meta?.quotation);
  const isImage = Boolean(m.attachmentMime?.startsWith("image/") && m.attachmentUrl);

  return (
    <div className={cn("flex flex-col gap-0.5", mine ? "items-end" : "items-start")}>
      <span className="text-[10px] font-medium text-muted-foreground px-1 max-w-[90%] truncate">
        {m.senderName}
      </span>
      <div
        className={cn(
          "px-3 py-2 text-sm max-w-[min(100%,20rem)] shadow-sm",
          perspective === "support"
            ? cn(
                "rounded-2xl ring-1 ring-inset",
                mine
                  ? "bg-gradient-to-br from-emerald-600 to-emerald-700 text-white ring-white/10"
                  : "bg-zinc-800/90 text-zinc-100 ring-white/5"
              )
            : cn(
                "rounded-lg",
                mine
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground border border-border/60"
              )
        )}
      >
        {isQuotation ? (
          <p className="text-[10px] font-semibold uppercase tracking-wide opacity-90 mb-1 flex items-center gap-1">
            <FileText className="h-3 w-3 shrink-0" />
            ขอใบเสนอราคา
          </p>
        ) : null}
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- user uploads from same origin
          <img
            src={m.attachmentUrl!}
            alt={m.attachmentName || ""}
            className="max-h-44 w-auto rounded-md mb-1.5 border border-white/20"
          />
        ) : null}
        {m.attachmentUrl && !isImage ? (
          <a
            href={m.attachmentUrl}
            download={m.attachmentName || true}
            className={cn(
              "text-xs underline underline-offset-2 block mb-1.5 break-all",
              mine ? "text-primary-foreground/90" : "text-primary"
            )}
          >
            📎 {m.attachmentName || "ดาวน์โหลดไฟล์"}
          </a>
        ) : null}
        <p className="whitespace-pre-wrap break-words">{m.body}</p>
        <p
          className={cn(
            "text-[10px] mt-1 opacity-80",
            mine ? "text-primary-foreground/80" : "text-muted-foreground"
          )}
        >
          {new Date(m.createdAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}
