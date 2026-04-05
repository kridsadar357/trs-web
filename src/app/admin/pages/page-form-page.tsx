"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import { AdminForm } from "@/components/admin/admin-form";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { ImageUpload } from "@/components/admin/image-upload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { contentHtmlFromJson } from "@/lib/sanitize-page-input";

function PageFormInner() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : null;
  const isNew = !id;

  const [form, setForm] = useState({
    title: "",
    slug: "",
    metaDescription: "",
    heroTitle: "",
    heroSubtitle: "",
    heroImage: "",
    order: 0,
    published: false,
    contentHtml: "",
  });

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/pages/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data || data.error) return;
        setForm({
          title: data.title || "",
          slug: data.slug || "",
          metaDescription: data.metaDescription || "",
          heroTitle: data.heroTitle || "",
          heroSubtitle: data.heroSubtitle || "",
          heroImage: data.heroImage || "",
          order: typeof data.order === "number" ? data.order : 0,
          published: Boolean(data.published),
          contentHtml: contentHtmlFromJson(data.content),
        });
      });
  }, [id]);

  const handleSave = async () => {
    const body = {
      title: form.title,
      slug: form.slug,
      metaDescription: form.metaDescription || null,
      heroTitle: form.heroTitle || null,
      heroSubtitle: form.heroSubtitle || null,
      heroImage: form.heroImage || null,
      order: form.order,
      published: form.published,
      contentHtml: form.contentHtml,
    };
    if (isNew) {
      const res = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "สร้างหน้าไม่สำเร็จ");
      }
    } else {
      const res = await fetch(`/api/admin/pages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "บันทึกไม่สำเร็จ");
      }
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    const res = await fetch(`/api/admin/pages/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("ลบไม่สำเร็จ");
  };

  return (
    <AdminForm
      title={isNew ? "เพิ่มหน้าใหม่" : "แก้ไขหน้า"}
      backHref="/admin/pages"
      wideLayout
      onSave={handleSave}
      onDelete={isNew ? undefined : handleDelete}
      initialData={isNew ? undefined : form}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        <Card className="lg:col-span-5">
          <CardContent className="space-y-4 p-6">
            <div className="space-y-2">
              <Label>ชื่อหน้า *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="เช่น เกี่ยวกับเรา"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug * (ไม่ต้องใส่ /)</Label>
              <Input
                value={form.slug}
                onChange={(e) =>
                  setForm({
                    ...form,
                    slug: e.target.value.replace(/^\//, "").replace(/\s+/g, "-").toLowerCase(),
                  })
                }
                placeholder="about"
              />
            </div>
            <div className="space-y-2">
              <Label>คำอธิบาย Meta (SEO)</Label>
              <Textarea
                value={form.metaDescription}
                onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                rows={3}
                className="resize-y"
                placeholder="คำอธิบายสั้นๆ สำหรับผลการค้นหา"
              />
            </div>
            <div className="space-y-2">
              <Label>หัวข้อ Hero (ถ้าใช้แม่แบบหน้า)</Label>
              <Input
                value={form.heroTitle}
                onChange={(e) => setForm({ ...form, heroTitle: e.target.value })}
                placeholder="ไม่บังคับ"
              />
            </div>
            <div className="space-y-2">
              <Label>คำบรรยาย Hero</Label>
              <Input
                value={form.heroSubtitle}
                onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })}
                placeholder="ไม่บังคับ"
              />
            </div>
            <div className="space-y-2">
              <Label>รูป Hero (URL)</Label>
              <ImageUpload value={form.heroImage} onChange={(url) => setForm({ ...form, heroImage: url })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ลำดับ</Label>
                <Input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: parseInt(e.target.value, 10) || 0 })}
                />
              </div>
              <label className="flex cursor-pointer items-end gap-2 pb-2">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                  className="rounded border-input"
                />
                <span className="text-sm">เผยแพร่</span>
              </label>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-7">
          <CardContent className="p-6">
            <Label className="mb-3 block text-base font-semibold">เนื้อหาหน้า (Rich text)</Label>
            <RichTextEditor
              content={form.contentHtml}
              onChange={(html) => setForm({ ...form, contentHtml: html })}
              placeholder="เนื้อหาหน้าเว็บ..."
            />
          </CardContent>
        </Card>
      </div>
    </AdminForm>
  );
}

export default function PageFormPage() {
  return (
    <Suspense fallback={<div className="py-8 text-center text-muted-foreground">กำลังโหลด...</div>}>
      <PageFormInner />
    </Suspense>
  );
}
