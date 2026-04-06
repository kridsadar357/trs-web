"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";

type Agent = {
  id: string;
  username: string;
  displayName: string;
  active: boolean;
  createdAt: string;
};

export default function AdminChatAgentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [creating, setCreating] = useState(false);
  const [pwEdit, setPwEdit] = useState<Record<string, string>>({});

  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";

  useEffect(() => {
    if (status !== "authenticated") return;
    if (!isAdmin) {
      router.replace("/admin");
    }
  }, [status, isAdmin, router]);

  const load = useCallback(() => {
    fetch("/api/admin/chat-agents")
      .then((r) => {
        if (r.status === 403) {
          router.replace("/admin");
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setAgents(data);
      });
  }, [router]);

  useEffect(() => {
    if (status === "authenticated" && isAdmin) load();
  }, [status, isAdmin, load]);

  async function createAgent(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password || !displayName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/admin/chat-agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim().toLowerCase(),
          password,
          displayName: displayName.trim(),
        }),
      });
      if (res.ok) {
        setUsername("");
        setPassword("");
        setDisplayName("");
        load();
      }
    } finally {
      setCreating(false);
    }
  }

  async function patchAgent(id: string, body: Record<string, unknown>) {
    const res = await fetch(`/api/admin/chat-agents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) load();
  }

  async function removeAgent(id: string) {
    if (!confirm("ลบบัญชีแชทนี้?")) return;
    const res = await fetch(`/api/admin/chat-agents/${id}`, { method: "DELETE" });
    if (res.ok) load();
  }

  if (status === "loading" || !isAdmin) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold">บัญชีแชทซัพพอร์ต</h1>
        <p className="text-muted-foreground text-sm mt-1">
          สร้างรหัสเข้าแอปแชท (chats.*) สำหรับทีมซัพพอร์ต — แยกจากแอดมิน CMS
        </p>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="font-medium mb-4">เพิ่มบัญชีใหม่</h2>
          <form onSubmit={createAgent} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="ca-user">ชื่อผู้ใช้</Label>
              <Input
                id="ca-user"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="off"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ca-pw">รหัสผ่าน</Label>
              <Input
                id="ca-pw"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
            <div className="space-y-2 sm:col-span-2 lg:col-span-1">
              <Label htmlFor="ca-name">ชื่อที่แสดง</Label>
              <Input
                id="ca-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={creating}>
              {creating ? "กำลังสร้าง…" : "สร้าง"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {agents.map((a) => (
          <Card key={a.id}>
            <CardContent className="p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">{a.displayName}</p>
                <p className="text-sm text-muted-foreground">@{a.username}</p>
                <Badge variant={a.active ? "default" : "outline"} className="mt-2 text-xs">
                  {a.active ? "ใช้งาน" : "ปิด"}
                </Badge>
              </div>
              <div className="flex flex-col gap-2 sm:items-end">
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => patchAgent(a.id, { active: !a.active })}
                  >
                    {a.active ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => void removeAgent(a.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2 items-center">
                  <Input
                    type="password"
                    placeholder="รหัสผ่านใหม่"
                    className="h-8 w-40 text-sm"
                    value={pwEdit[a.id] ?? ""}
                    onChange={(e) => setPwEdit((prev) => ({ ...prev, [a.id]: e.target.value }))}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={!(pwEdit[a.id]?.length)}
                    onClick={async () => {
                      const p = pwEdit[a.id];
                      if (!p) return;
                      await patchAgent(a.id, { password: p });
                      setPwEdit((prev) => ({ ...prev, [a.id]: "" }));
                    }}
                  >
                    เปลี่ยนรหัส
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {agents.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground text-sm">ยังไม่มีบัญชีแชท</p>
      ) : null}
    </div>
  );
}
