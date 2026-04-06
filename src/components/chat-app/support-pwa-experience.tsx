"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, BellOff, Download, Share2, X } from "lucide-react";
import { getSupportChatPathBase } from "@/lib/support-chat-path-base";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const INSTALL_DISMISS_KEY = "trs-support-pwa-install-dismissed-at";
const INSTALL_COOLDOWN_MS = 1000 * 60 * 60 * 72;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = typeof atob === "function" ? atob(base64) : "";
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

function serviceWorkerScope(): string {
  if (typeof window === "undefined") return "/chat-app/";
  return window.location.hostname.toLowerCase().startsWith("chats.") ? "/" : "/chat-app/";
}

function isStandalonePwa(): boolean {
  if (typeof window === "undefined") return false;
  const mq = window.matchMedia("(display-mode: standalone)");
  const ios = (window.navigator as Navigator & { standalone?: boolean }).standalone;
  return mq.matches || ios === true;
}

function isIosDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function pathnameIsInbox(path: string): boolean {
  return path === "/inbox" || path.endsWith("/inbox") || /\/chat-app\/inbox\/?$/.test(path);
}

export function SupportPwaExperience({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [installSheet, setInstallSheet] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [hasDeferredInstall, setHasDeferredInstall] = useState(false);
  const deferredRef = useRef<{ prompt: () => Promise<void> } | null>(null);

  const vapidConfigured = Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY);
  /** Offer push on inbox in both browser and installed PWA (previously standalone hid this bar). */
  const showPushBar = authenticated && vapidConfigured && pathnameIsInbox(pathname);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/chat-support/me", { credentials: "include" })
      .then(async (r) => {
        const j = (await r.json().catch(() => ({}))) as { authenticated?: boolean };
        if (!cancelled) setAuthenticated(j.authenticated === true);
      })
      .catch(() => {
        if (!cancelled) setAuthenticated(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    const scope = serviceWorkerScope();
    navigator.serviceWorker.register("/sw-support.js", { scope }).catch(() => {});
  }, []);

  useEffect(() => {
    function onBeforeInstall(e: Event) {
      e.preventDefault();
      deferredRef.current = e as unknown as { prompt: () => Promise<void> };
      setHasDeferredInstall(true);
      const last = Number(localStorage.getItem(INSTALL_DISMISS_KEY) || "0");
      if (Date.now() - last < INSTALL_COOLDOWN_MS) return;
      if (isStandalonePwa()) return;
      setInstallSheet(true);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  useEffect(() => {
    if (isStandalonePwa()) return;
    if (!isIosDevice()) return;
    const last = Number(localStorage.getItem(INSTALL_DISMISS_KEY) || "0");
    if (Date.now() - last < INSTALL_COOLDOWN_MS) return;
    setInstallSheet(true);
  }, []);

  useEffect(() => {
    if (!authenticated || !vapidConfigured || typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setPushEnabled(!!sub))
      .catch(() => setPushEnabled(false));
  }, [authenticated, vapidConfigured]);

  const dismissInstall = useCallback(() => {
    localStorage.setItem(INSTALL_DISMISS_KEY, String(Date.now()));
    setInstallSheet(false);
  }, []);

  const runInstall = useCallback(async () => {
    const d = deferredRef.current;
    if (d) {
      try {
        await d.prompt();
      } catch {
        /* ignore */
      }
      deferredRef.current = null;
    }
    setInstallSheet(false);
  }, []);

  const enablePush = useCallback(async () => {
    const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!key || !authenticated) return;
    setPushBusy(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") return;
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        const keyBytes = urlBase64ToUint8Array(key);
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: keyBytes.buffer.slice(
            keyBytes.byteOffset,
            keyBytes.byteOffset + keyBytes.byteLength
          ) as ArrayBuffer,
        });
      }
      const json = sub.toJSON();
      const res = await fetch("/api/chat-support/push/subscribe", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: json,
          pathBase: getSupportChatPathBase(),
        }),
      });
      if (res.ok) setPushEnabled(true);
    } catch {
      /* ignore */
    } finally {
      setPushBusy(false);
    }
  }, [authenticated]);

  const disablePush = useCallback(async () => {
    setPushBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        const json = sub.toJSON();
        await fetch("/api/chat-support/push/unsubscribe", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: json.endpoint }),
        });
        await sub.unsubscribe();
      }
      setPushEnabled(false);
    } catch {
      /* ignore */
    } finally {
      setPushBusy(false);
    }
  }, []);

  const showIosHint = isIosDevice() && !hasDeferredInstall;

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col overflow-hidden", showPushBar && "pb-[5.5rem]")}>
      {children}

      {showPushBar ? (
        <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-[60] flex justify-center p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="pointer-events-auto flex max-w-md flex-1 items-center gap-2 rounded-2xl border border-white/10 bg-zinc-900/90 px-3 py-2.5 shadow-2xl shadow-black/50 backdrop-blur-xl">
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-xs font-semibold text-zinc-100">แจ้งเตือนข้อความลูกค้า</span>
              <span className="text-[11px] text-zinc-500">แสดงบนหน้าจอแม้ปิดแท็บ (ต้องอนุญาต)</span>
            </div>
            {pushEnabled ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-9 shrink-0 border-white/15 bg-transparent text-zinc-300"
                disabled={pushBusy}
                onClick={() => void disablePush()}
              >
                <BellOff className="mr-1.5 h-3.5 w-3.5" />
                ปิด
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                className="h-9 shrink-0 bg-gradient-to-r from-emerald-600 to-emerald-500"
                disabled={pushBusy}
                onClick={() => void enablePush()}
              >
                <Bell className="mr-1.5 h-3.5 w-3.5" />
                เปิด
              </Button>
            )}
          </div>
        </div>
      ) : null}

      {installSheet && !isStandalonePwa() ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:items-center">
          <div
            className={cn(
              "relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10",
              "bg-gradient-to-b from-zinc-900 to-zinc-950 shadow-2xl shadow-emerald-900/20"
            )}
            role="dialog"
            aria-labelledby="pwa-install-title"
          >
            <button
              type="button"
              className="absolute right-3 top-3 rounded-full p-2 text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
              aria-label="ปิด"
              onClick={dismissInstall}
            >
              <X className="h-4 w-4" />
            </button>
            <div className="px-6 pb-6 pt-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/30 to-blue-500/10 ring-1 ring-white/10">
                <Download className="h-8 w-8 text-emerald-400" strokeWidth={1.5} />
              </div>
              <h2 id="pwa-install-title" className="text-lg font-semibold tracking-tight text-white">
                ติดตั้ง TRS Support
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                เพิ่มไปที่หน้าจอโฮมเพื่อเปิดแอปได้ทันที แบบเต็มจอ ใกล้เคียงแอป native
              </p>

              {showIosHint ? (
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left">
                  <div className="flex items-start gap-3">
                    <Share2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                    <div>
                      <p className="text-sm font-medium text-zinc-200">บน iPhone / iPad</p>
                      <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                        แตะปุ่ม <strong className="text-zinc-400">แชร์</strong> ใน Safari แล้วเลือก{" "}
                        <strong className="text-zinc-400">เพิ่มไปยังหน้าจอโฮม</strong>
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="mt-6 flex flex-col gap-2">
                {!showIosHint ? (
                  <Button
                    type="button"
                    className="h-11 w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-base font-semibold shadow-lg shadow-emerald-900/30"
                    onClick={() => void runInstall()}
                  >
                    ติดตั้งแอป
                  </Button>
                ) : null}
                <Button type="button" variant="ghost" className="text-zinc-500 hover:text-zinc-300" onClick={dismissInstall}>
                  ภายหลัง
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
