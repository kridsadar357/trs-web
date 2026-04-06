"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Headphones } from "lucide-react";
import { chatAppPath } from "@/lib/chat-app-routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SupportShell } from "@/components/chat-app/support-shell";
import { cn } from "@/lib/utils";

export default function ChatSupportLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat-support/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError((j as { error?: string }).error || "เข้าสู่ระบบไม่สำเร็จ");
        return;
      }
      router.replace(chatAppPath("/inbox"));
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <SupportShell className="justify-center px-4 py-8">
      <div className="mx-auto w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-blue-500/10 ring-1 ring-white/10">
            <Headphones className="h-7 w-7 text-emerald-400" strokeWidth={1.5} />
          </div>
          <p className="mb-1 text-2xl font-bold tracking-tight text-white">TRS</p>
          <h1 className="text-lg font-semibold tracking-tight text-white">Support Console</h1>
          <p className="mt-1 text-sm text-zinc-400">เข้าสู่ระบบทีมซัพพอร์ต — แชทแบบเรียลไทม์</p>
        </div>

        <div
          className={cn(
            "rounded-2xl border border-white/10 bg-zinc-900/40 p-6 shadow-2xl shadow-black/40",
            "backdrop-blur-xl"
          )}
        >
          <form onSubmit={onSubmit} className="space-y-5">
            {error ? (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </p>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="u" className="text-zinc-300">
                ชื่อผู้ใช้
              </Label>
              <Input
                id="u"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-11 border-white/10 bg-zinc-950/60 text-zinc-100 placeholder:text-zinc-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p" className="text-zinc-300">
                รหัสผ่าน
              </Label>
              <div className="relative">
                <Input
                  id="p"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 border-white/10 bg-zinc-950/60 pr-11 text-zinc-100 placeholder:text-zinc-500"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                  aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="h-11 w-full bg-gradient-to-r from-emerald-600 to-emerald-500 font-medium shadow-lg shadow-emerald-900/30 hover:from-emerald-500 hover:to-emerald-400"
              disabled={loading}
            >
              {loading ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
            </Button>
          </form>
        </div>
        <p className="text-center text-xs text-zinc-500">TRS · ลงชื่อเข้าใช้เฉพาะพนักงานที่ได้รับอนุญาต</p>
      </div>
    </SupportShell>
  );
}
