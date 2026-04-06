"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { Save, Check, ExternalLink } from "lucide-react";

const emptyHero = {
  homeHeroBadge: "",
  homeHeroSubtitle: "",
  homeHeroTitleBefore: "",
  homeHeroTitleHighlight: "",
  homeHeroTitleAfter: "",
  homeHeroPrimaryCtaText: "",
  homeHeroSecondaryCtaText: "",
  homeHeroImage: "",
  homeHeroStats: "",
  homeHeroUseCustomHtml: false,
  homeHeroCustomHtml: "",
};

export default function AdminHeroDesignPage() {
  const [hero, setHero] = useState(emptyHero);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data: Record<string, string>) => {
        if (!data || typeof data !== "object") return;
        const flag = data.homeHeroUseCustomHtml;
        const useCustom =
          flag === "1" || flag === "true" || flag === "yes" || flag?.toLowerCase?.() === "on";
        setHero({
          homeHeroBadge: data.homeHeroBadge || "",
          homeHeroSubtitle: data.homeHeroSubtitle || "",
          homeHeroTitleBefore: data.homeHeroTitleBefore || "",
          homeHeroTitleHighlight: data.homeHeroTitleHighlight || "",
          homeHeroTitleAfter: data.homeHeroTitleAfter || "",
          homeHeroPrimaryCtaText: data.homeHeroPrimaryCtaText || "",
          homeHeroSecondaryCtaText: data.homeHeroSecondaryCtaText || "",
          homeHeroImage: data.homeHeroImage || "",
          homeHeroStats: data.homeHeroStats || "",
          homeHeroUseCustomHtml: useCustom,
          homeHeroCustomHtml: data.homeHeroCustomHtml || "",
        });
      });
  }, []);

  const update = (patch: Partial<typeof emptyHero>) => setHero((h) => ({ ...h, ...patch }));

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          homeHeroBadge: hero.homeHeroBadge,
          homeHeroSubtitle: hero.homeHeroSubtitle,
          homeHeroTitleBefore: hero.homeHeroTitleBefore,
          homeHeroTitleHighlight: hero.homeHeroTitleHighlight,
          homeHeroTitleAfter: hero.homeHeroTitleAfter,
          homeHeroPrimaryCtaText: hero.homeHeroPrimaryCtaText,
          homeHeroSecondaryCtaText: hero.homeHeroSecondaryCtaText,
          homeHeroImage: hero.homeHeroImage,
          homeHeroStats: hero.homeHeroStats,
          homeHeroUseCustomHtml: hero.homeHeroUseCustomHtml ? "1" : "",
          homeHeroCustomHtml: hero.homeHeroCustomHtml,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert("บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Hero Design</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            แก้ไข Hero หน้าแรก — เลย์เอาต์มาตรฐานหรือ HTML แบบกำหนดเอง (แสดงบนเว็บไซต์ทันทีหลังบันทึก)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <ExternalLink className="h-4 w-4" />
            ดูหน้าแรก
          </a>
          <Button size="sm" className="gap-2" onClick={handleSave} disabled={saving}>
            {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saved ? "บันทึกแล้ว" : saving ? "กำลังบันทึก..." : "บันทึก Hero"}
          </Button>
        </div>
      </div>

      <Card className="border-primary/20 bg-primary/[0.03]">
        <CardHeader>
          <CardTitle className="text-lg">โหมด HTML แบบกำหนดเอง</CardTitle>
          <CardDescription>
            เปิดใช้แล้วจะแสดงเฉพาะบล็อก HTML ด้านล่างแทนเลย์เอาต์ Hero มาตรฐาน (หัวข้อ ปุ่ม รูป สถิติ) — เหมาะกับการจัดวางแบบเต็มหน้าจอ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={hero.homeHeroUseCustomHtml}
              onChange={(e) => update({ homeHeroUseCustomHtml: e.target.checked })}
              className="h-4 w-4 rounded border-input"
            />
            <span className="text-sm font-medium">ใช้ HTML กำหนดเองแทน Hero มาตรฐาน</span>
          </label>
          <div className="space-y-2">
            <Label>เนื้อหา Hero (Rich text / HTML)</Label>
            <RichTextEditor
              content={hero.homeHeroCustomHtml}
              onChange={(html) => update({ homeHeroCustomHtml: html })}
              placeholder="ออกแบบ Hero ด้วยหัวข้อ ย่อหน้า รูป ปุ่ม ฯลฯ..."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Hero มาตรฐาน (เมื่อปิดโหมด HTML)</CardTitle>
          <CardDescription>
            ข้อความว่างจะใช้ค่าตั้งต้นตามภาษา (ไทย/อังกฤษ) บนเว็บไซต์ — ดูรายละเอียดที่{" "}
            <Link href="/admin/settings" className="text-primary underline">
              ตั้งค่า
            </Link>{" "}
            สำหรับข้อมูลอื่นของเว็บ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>ป้ายเล็ก (Badge)</Label>
              <Input
                value={hero.homeHeroBadge}
                onChange={(e) => update({ homeHeroBadge: e.target.value })}
                placeholder="เช่น โซลูชันองค์กร"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>คำอธิบายใต้หัวข้อ (Subtitle)</Label>
              <Textarea
                rows={3}
                value={hero.homeHeroSubtitle}
                onChange={(e) => update({ homeHeroSubtitle: e.target.value })}
                placeholder="ประโยคสรุปใต้หัวข้อหลัก"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>หัวข้อ — ก่อนคำเน้น</Label>
              <Input value={hero.homeHeroTitleBefore} onChange={(e) => update({ homeHeroTitleBefore: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>หัวข้อ — คำเน้น (ไล่สี)</Label>
              <Input
                value={hero.homeHeroTitleHighlight}
                onChange={(e) => update({ homeHeroTitleHighlight: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>หัวข้อ — หลังคำเน้น</Label>
              <Input value={hero.homeHeroTitleAfter} onChange={(e) => update({ homeHeroTitleAfter: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>ปุ่มหลัก (Primary CTA)</Label>
              <Input
                value={hero.homeHeroPrimaryCtaText}
                onChange={(e) => update({ homeHeroPrimaryCtaText: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>ปุ่มรอง (Secondary CTA)</Label>
              <Input
                value={hero.homeHeroSecondaryCtaText}
                onChange={(e) => update({ homeHeroSecondaryCtaText: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>รูป Hero (URL หรือ path ใน public)</Label>
            <Input
              value={hero.homeHeroImage}
              onChange={(e) => update({ homeHeroImage: e.target.value })}
              placeholder="/hero/hero-fallback.svg"
            />
          </div>
          <div className="space-y-2">
            <Label>ตัวเลขสรุป (JSON — ถ้าว่างใช้ค่าตั้งต้นจากภาษา)</Label>
            <Textarea
              rows={4}
              value={hero.homeHeroStats}
              onChange={(e) => update({ homeHeroStats: e.target.value })}
              placeholder='[{"value":"150+","label":"โครงการ"}]'
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
