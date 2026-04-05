"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { AdminForm } from "@/components/admin/admin-form";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { ImageUpload, GalleryUpload } from "@/components/admin/image-upload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, X } from "lucide-react";
import { generateSlug } from "@/lib/slugify";

function PortfolioFormInner() {
  const searchParams = useSearchParams();
  const params = useParams();
  const idFromRoute = typeof params?.id === "string" ? params.id : null;
  const editId = searchParams.get("edit") || idFromRoute;
  const isEditing = !!editId;

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    content: "",
    client: "",
    category: "",
    technologies: [] as string[],
    imageUrl: "",
    gallery: [] as string[],
    featured: false,
    published: true,
    completedAt: "",
  });
  const [techInput, setTechInput] = useState("");

  useEffect(() => {
    if (!editId) return;
    fetch(`/api/admin/portfolio/${editId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data || data.error) return;
        setForm({
          title: data.title || "",
          slug: data.slug || "",
          description: data.description || "",
          content: data.content || "",
          client: data.client || "",
          category: data.category || "",
          technologies: Array.isArray(data.technologies) ? data.technologies : [],
          imageUrl: data.imageUrl || "",
          gallery: Array.isArray(data.gallery) ? data.gallery : [],
          featured: data.featured || false,
          published: data.published ?? true,
          completedAt: data.completedAt ? new Date(data.completedAt).toISOString().split("T")[0] : "",
        });
      });
  }, [editId]);

  const handleSave = async () => {
    const url = isEditing ? `/api/admin/portfolio/${editId}` : "/api/admin/portfolio";
    const method = isEditing ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to save");
    }
  };

  const handleDelete = async () => {
    if (!editId) return;
    await fetch(`/api/admin/portfolio/${editId}`, { method: "DELETE" });
  };

  return (
    <AdminForm
      title={isEditing ? "แก้ไขผลงาน" : "เพิ่มผลงาน"}
      backHref="/admin/portfolio"
      wideLayout
      onSave={handleSave}
      onDelete={isEditing ? handleDelete : undefined}
      initialData={isEditing ? form : undefined}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        {/* ข้อมูลโปรเจกต์ — ซ้าย / บนมือถือ */}
        <Card className="lg:col-span-6">
          <CardContent className="space-y-4 p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>ชื่อโปรเจกต์ *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setForm({ ...form, title, slug: isEditing ? form.slug : generateSlug(title) });
                  }}
                  placeholder="ชื่อโปรเจกต์"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Slug *</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="url-slug"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>คำอธิบายสั้น *</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="สรุปสั้น ๆ สำหรับการ์ดและ SEO"
                rows={3}
                className="resize-y"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>ลูกค้า</Label>
                <Input
                  value={form.client}
                  onChange={(e) => setForm({ ...form, client: e.target.value })}
                  placeholder="ชื่อลูกค้า"
                />
              </div>
              <div className="space-y-2">
                <Label>หมวดหมู่</Label>
                <Input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="เช่น Web Application"
                />
              </div>
              <div className="space-y-2">
                <Label>วันที่เสร็จ</Label>
                <Input
                  type="date"
                  value={form.completedAt}
                  onChange={(e) => setForm({ ...form, completedAt: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>เทคโนโลยี</Label>
              <div className="mb-2 flex flex-wrap gap-1.5">
                {form.technologies.map((tech) => (
                  <Badge key={tech} variant="secondary" className="gap-1">
                    {tech}
                    <button
                      type="button"
                      onClick={() =>
                        setForm({ ...form, technologies: form.technologies.filter((t) => t !== tech) })
                      }
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  placeholder="พิมพ์แล้วกด Enter"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (techInput.trim() && !form.technologies.includes(techInput.trim())) {
                        setForm({ ...form, technologies: [...form.technologies, techInput.trim()] });
                        setTechInput("");
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (techInput.trim() && !form.technologies.includes(techInput.trim())) {
                      setForm({ ...form, technologies: [...form.technologies, techInput.trim()] });
                      setTechInput("");
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>รูปปก (Thumbnail)</Label>
              <ImageUpload value={form.imageUrl} onChange={(url) => setForm({ ...form, imageUrl: url })} />
            </div>

            <div className="space-y-2">
              <Label>แกลเลอรี</Label>
              <GalleryUpload value={form.gallery} onChange={(urls) => setForm({ ...form, gallery: urls })} />
            </div>

            <div className="flex flex-wrap items-center gap-6 border-t pt-4">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                  className="rounded border-input"
                />
                <span className="text-sm">เผยแพร่</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="rounded border-input"
                />
                <span className="text-sm">แนะนำ (Featured)</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* เนื้อหาโปรเจกต์ — ขวา / คู่กันบนจอใหญ่ */}
        <Card className="lg:col-span-6">
          <CardContent className="p-6">
            <Label className="mb-3 block text-base font-semibold">เนื้อหาโปรเจกต์ (รายละเอียดเต็ม)</Label>
            <p className="mb-3 text-xs text-muted-foreground">
              ใช้แถบเครื่องมือด้านบนเพื่อจัดรูปแบบ แทรกรูป วิดีโอ แกลเลอรี และบล็อกพิเศษ
            </p>
            <RichTextEditor
              content={form.content}
              onChange={(content) => setForm({ ...form, content })}
              placeholder="รายละเอียดโปรเจกต์ เคสสตัดดี้ ผลลัพธ์ ฯลฯ"
            />
          </CardContent>
        </Card>
      </div>
    </AdminForm>
  );
}

export default function PortfolioFormPage() {
  return (
    <Suspense fallback={<div className="py-8 text-center text-muted-foreground">กำลังโหลด...</div>}>
      <PortfolioFormInner />
    </Suspense>
  );
}
