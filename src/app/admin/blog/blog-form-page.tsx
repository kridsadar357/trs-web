"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { AdminForm } from "@/components/admin/admin-form";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { ImageUpload } from "@/components/admin/image-upload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, X } from "lucide-react";
import { generateSlug } from "@/lib/slugify";

function BlogFormInner() {
  const searchParams = useSearchParams();
  const params = useParams();
  const idFromRoute = typeof params?.id === "string" ? params.id : null;
  const editId = searchParams.get("edit") || idFromRoute;
  const isEditing = !!editId;

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    category: "",
    tags: [] as string[],
    authorName: "",
    published: false,
    featured: false,
  });
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (!editId) return;
    fetch(`/api/admin/blog/${editId}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data || data.error) return;
        setForm({
          title: data.title || "",
          slug: data.slug || "",
          excerpt: data.excerpt || "",
          content: data.content || "",
          coverImage: data.coverImage || "",
          category: data.category || "",
          tags: Array.isArray(data.tags) ? data.tags : [],
          authorName: data.authorName || "",
          published: data.published || false,
          featured: data.featured || false,
        });
      });
  }, [editId]);

  const handleSave = async () => {
    const url = isEditing ? `/api/admin/blog/${editId}` : "/api/admin/blog";
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
    await fetch(`/api/admin/blog/${editId}`, { method: "DELETE" });
  };

  return (
    <AdminForm
      title={isEditing ? "แก้ไขบทความ" : "เขียนบทความใหม่"}
      backHref="/admin/blog"
      wideLayout
      onSave={handleSave}
      onDelete={isEditing ? handleDelete : undefined}
      initialData={isEditing ? form : undefined}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        <Card className="lg:col-span-5">
          <CardContent className="space-y-4 p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>หัวข้อ *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setForm({
                      ...form,
                      title,
                      slug: isEditing ? form.slug : generateSlug(title),
                    });
                  }}
                  placeholder="หัวข้อโพสต์"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Slug *</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="post-url-slug"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>สรุป (Excerpt)</Label>
              <Textarea
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                placeholder="คำโปรยสำหรับหน้ารายการ..."
                rows={3}
                className="resize-y"
              />
            </div>

            <div className="space-y-2">
              <Label>รูปปก</Label>
              <ImageUpload value={form.coverImage} onChange={(url) => setForm({ ...form, coverImage: url })} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>หมวดหมู่</Label>
                <Input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="เช่น Technology"
                />
              </div>
              <div className="space-y-2">
                <Label>ผู้เขียน</Label>
                <Input
                  value={form.authorName}
                  onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                  placeholder="ชื่อผู้เขียน"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>แท็ก</Label>
              <div className="mb-2 flex flex-wrap gap-1.5">
                {form.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, tags: form.tags.filter((t) => t !== tag) })}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="เพิ่มแท็ก"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
                        setForm({ ...form, tags: [...form.tags, tagInput.trim()] });
                        setTagInput("");
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
                      setForm({ ...form, tags: [...form.tags, tagInput.trim()] });
                      setTagInput("");
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
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

        <Card className="lg:col-span-7">
          <CardContent className="p-6">
            <Label className="mb-3 block text-base font-semibold">เนื้อหา *</Label>
            <RichTextEditor
              content={form.content}
              onChange={(content) => setForm({ ...form, content })}
              placeholder="เขียนเนื้อหาบทความ..."
            />
          </CardContent>
        </Card>
      </div>
    </AdminForm>
  );
}

export default function BlogFormPage() {
  return (
    <Suspense fallback={<div className="py-8 text-center text-muted-foreground">กำลังโหลด...</div>}>
      <BlogFormInner />
    </Suspense>
  );
}
