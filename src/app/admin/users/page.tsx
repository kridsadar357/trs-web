"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, UserPlus } from "lucide-react";

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
};

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const myId = (session?.user as { id?: string } | undefined)?.id;

  const [users, setUsers] = useState<UserRow[]>([]);
  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("admin");

  const [editing, setEditing] = useState<UserRow | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("admin");
  const [editPassword, setEditPassword] = useState("");

  const load = () => {
    setLoadError("");
    fetch("/api/admin/users")
      .then((r) => {
        if (r.status === 403) throw new Error("ไม่มีสิทธิ์");
        return r.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
        else setLoadError(data.error || "โหลดไม่สำเร็จ");
      })
      .catch(() => setLoadError("โหลดไม่สำเร็จ"));
  };

  useEffect(() => {
    if (status === "authenticated" && role === "admin") load();
  }, [status, role]);

  const startEdit = (u: UserRow) => {
    setEditing(u);
    setEditEmail(u.email);
    setEditName(u.name || "");
    setEditRole(u.role || "admin");
    setEditPassword("");
    setFormError("");
  };

  const cancelEdit = () => {
    setEditing(null);
    setFormError("");
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail,
          password: newPassword,
          name: newName || null,
          role: newRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "สร้างไม่สำเร็จ");
      setNewEmail("");
      setNewPassword("");
      setNewName("");
      setNewRole("admin");
      load();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "สร้างไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setFormError("");
    setSaving(true);
    try {
      const payload: Record<string, string | null> = {
        email: editEmail,
        name: editName || null,
        role: editRole,
      };
      if (editPassword.trim()) payload.password = editPassword;

      const res = await fetch(`/api/admin/users/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "บันทึกไม่สำเร็จ");
      cancelEdit();
      load();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ลบผู้ใช้นี้?")) return;
    setFormError("");
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setFormError(data.error || "ลบไม่สำเร็จ");
      return;
    }
    load();
  };

  if (status === "loading") {
    return <div className="py-12 text-center text-muted-foreground">กำลังโหลด...</div>;
  }

  if (role !== "admin") {
    return (
      <div className="max-w-lg rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-sm">
        เฉพาะผู้ดูแลระบบ (admin) เท่านั้นที่จัดการผู้ใช้ได้
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold">ผู้ใช้แอดมิน</h1>
        <p className="mt-1 text-sm text-muted-foreground">เพิ่ม แก้ไข และลบบัญชีเข้าสู่ระบบแผงผู้ดูแล</p>
      </div>

      {loadError && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {loadError}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserPlus className="h-5 w-5" />
            เพิ่มผู้ใช้
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid max-w-xl gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>อีเมล</Label>
              <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>รหัสผ่าน (อย่างน้อย 8 ตัว)</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>ชื่อที่แสดง (ไม่บังคับ)</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>บทบาท</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              >
                <option value="admin">admin</option>
                <option value="editor">editor</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={saving}>
                {saving ? "กำลังสร้าง..." : "สร้างผู้ใช้"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {editing && (
        <Card className="border-primary/40">
          <CardHeader>
            <CardTitle className="text-lg">แก้ไขผู้ใช้</CardTitle>
            <p className="text-xs text-muted-foreground">{editing.email}</p>
          </CardHeader>
          <CardContent>
            {formError && <p className="mb-3 text-sm text-destructive">{formError}</p>}
            <form onSubmit={handleUpdate} className="grid max-w-xl gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>อีเมล</Label>
                <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>รหัสผ่านใหม่ (เว้นว่างถ้าไม่เปลี่ยน)</Label>
                <Input type="password" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>ชื่อที่แสดง</Label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>บทบาท</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                >
                  <option value="admin">admin</option>
                  <option value="editor">editor</option>
                </select>
              </div>
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit" disabled={saving}>
                  {saving ? "กำลังบันทึก..." : "บันทึก"}
                </Button>
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  ยกเลิก
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">รายชื่อผู้ใช้</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">อีเมล</th>
                <th className="pb-2 pr-4 font-medium">ชื่อ</th>
                <th className="pb-2 pr-4 font-medium">บทบาท</th>
                <th className="pb-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border/60">
                  <td className="py-3 pr-4">{u.email}</td>
                  <td className="py-3 pr-4">{u.name || "—"}</td>
                  <td className="py-3 pr-4">
                    <Badge variant="secondary">{u.role}</Badge>
                  </td>
                  <td className="py-3 text-right">
                    <Button type="button" variant="ghost" size="sm" className="gap-1" onClick={() => startEdit(u)}>
                      <Pencil className="h-4 w-4" />
                      แก้ไข
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-destructive hover:text-destructive"
                      disabled={u.id === myId}
                      onClick={() => handleDelete(u.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      ลบ
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && !loadError ? (
            <p className="py-6 text-center text-sm text-muted-foreground">ยังไม่มีผู้ใช้</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
