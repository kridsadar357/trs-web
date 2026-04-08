"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, Check } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState("");
  const [pwError, setPwError] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then(setSettings);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert("บันทึกการตั้งค่าไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const update = (key: string, value: string) => {
    setSettings({ ...settings, [key]: value });
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwMessage("");
    if (newPassword !== confirmPassword) {
      setPwError("รหัสผ่านใหม่ไม่ตรงกัน");
      return;
    }
    setPwSaving(true);
    try {
      const res = await fetch("/api/admin/me/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "เปลี่ยนรหัสผ่านไม่สำเร็จ");
      setPwMessage("เปลี่ยนรหัสผ่านแล้ว");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setPwError(err instanceof Error ? err.message : "เปลี่ยนรหัสผ่านไม่สำเร็จ");
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-bold">ตั้งค่า</h1>
          <p className="text-muted-foreground text-sm mt-1">จัดการการตั้งค่าเว็บไซต์</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? "บันทึกแล้ว!" : saving ? "กำลังบันทึก..." : "บันทึกทั้งหมด"}
        </Button>
      </div>

      <div className="grid gap-6 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">โปรไฟล์ — เปลี่ยนรหัสผ่าน</CardTitle>
            <p className="text-sm text-muted-foreground">ใช้รหัสผ่านปัจจุบันเพื่อตั้งรหัสใหม่ (อย่างน้อย 8 ตัวอักษร)</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
              {pwError && <p className="text-sm text-destructive">{pwError}</p>}
              {pwMessage && <p className="text-sm text-green-600 dark:text-green-400">{pwMessage}</p>}
              <div className="space-y-2">
                <Label>รหัสผ่านปัจจุบัน</Label>
                <Input
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>รหัสผ่านใหม่</Label>
                <Input
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <Label>ยืนยันรหัสผ่านใหม่</Label>
                <Input
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <Button type="submit" disabled={pwSaving}>
                {pwSaving ? "กำลังบันทึก..." : "อัปเดตรหัสผ่าน"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Site Name</Label>
              <Input
                value={settings.siteName || ""}
                onChange={(e) => update("siteName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Site Description</Label>
              <Input
                value={settings.siteDescription || ""}
                onChange={(e) => update("siteDescription", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Site URL</Label>
              <Input
                value={settings.siteUrl || ""}
                onChange={(e) => update("siteUrl", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">หน้าแรก — Hero</CardTitle>
            <p className="text-sm text-muted-foreground">
              แก้ไขข้อความ รูป สถิติ และโหมด HTML ของ Hero ได้ที่เมนู{" "}
              <a href="/admin/hero-design" className="font-medium text-primary underline">
                Hero Design
              </a>
            </p>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Home CTA (Database Driven)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>CTA Title</Label>
              <Input value={settings.homeCtaTitle || ""} onChange={(e) => update("homeCtaTitle", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>CTA Subtitle</Label>
              <Input value={settings.homeCtaSubtitle || ""} onChange={(e) => update("homeCtaSubtitle", e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Primary Button Text</Label>
                <Input value={settings.homeCtaPrimaryText || ""} onChange={(e) => update("homeCtaPrimaryText", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Secondary Button Text</Label>
                <Input value={settings.homeCtaSecondaryText || ""} onChange={(e) => update("homeCtaSecondaryText", e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Contact Email</Label>
              <Input
                value={settings.contactEmail || ""}
                onChange={(e) => update("contactEmail", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Contact Phone</Label>
              <Input
                value={settings.contactPhone || ""}
                onChange={(e) => update("contactPhone", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={settings.address || ""}
                onChange={(e) => update("address", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Social Media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Twitter</Label>
              <Input
                value={settings.socialTwitter || ""}
                onChange={(e) => update("socialTwitter", e.target.value)}
                placeholder="https://twitter.com/..."
              />
            </div>
            <div className="space-y-2">
              <Label>LinkedIn</Label>
              <Input
                value={settings.socialLinkedin || ""}
                onChange={(e) => update("socialLinkedin", e.target.value)}
                placeholder="https://linkedin.com/company/..."
              />
            </div>
            <div className="space-y-2">
              <Label>GitHub</Label>
              <Input
                value={settings.socialGithub || ""}
                onChange={(e) => update("socialGithub", e.target.value)}
                placeholder="https://github.com/..."
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
