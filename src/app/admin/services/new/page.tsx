"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AdminForm } from "@/components/admin/admin-form";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { ImageUpload } from "@/components/admin/image-upload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X } from "lucide-react";
import { generateSlug } from "@/lib/slugify";

export default function ServiceFormPage() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditing = !!editId;

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    coverImage: "",
    detailContent: "",
    icon: "",
    features: [] as string[],
    order: 0,
    published: true,
  });
  const [featureInput, setFeatureInput] = useState("");

  useEffect(() => {
    if (editId) {
      fetch(`/api/admin/services/${editId}`)
        .then((r) => r.json())
        .then((data) => {
          setForm({
            title: data.title || "",
            slug: data.slug || "",
            description: data.description || "",
            coverImage: data.coverImage || "",
            detailContent: data.detailContent || "",
            icon: data.icon || "",
            features: Array.isArray(data.features) ? data.features : [],
            order: data.order || 0,
            published: data.published ?? true,
          });
        });
    }
  }, [editId]);

  const payload = () => ({
    title: form.title,
    slug: form.slug,
    description: form.description,
    coverImage: form.coverImage.trim() || null,
    detailContent: form.detailContent.trim() || null,
    icon: form.icon.trim() || null,
    features: form.features,
    order: form.order,
    published: form.published,
  });

  const handleSave = async () => {
    const url = isEditing ? `/api/admin/services/${editId}` : "/api/admin/services";
    const method = isEditing ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload()),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to save");
    }
  };

  const handleDelete = async () => {
    await fetch(`/api/admin/services/${editId}`, { method: "DELETE" });
  };

  return (
    <AdminForm
      title={isEditing ? "Edit Service" : "New Service"}
      backHref="/admin/services"
      onSave={handleSave}
      onDelete={isEditing ? handleDelete : undefined}
      initialData={isEditing ? form : undefined}
    >
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setForm({ ...form, title, slug: generateSlug(title) });
                }}
                placeholder="Service title"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug *</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="service-url-slug"
              />
              <p className="text-xs text-muted-foreground">Public URL: /services/{form.slug || "…"}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Short description *</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Shown on the services list and at the top of the detail page"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Display order</Label>
              <Input
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: parseInt(e.target.value, 10) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label>Home icon (optional)</Label>
              <Input
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                placeholder="Lucide name, e.g. Code"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
              className="rounded border-gray-300"
            />
            <span className="text-sm">Published</span>
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Cover image</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground mb-3">
            Used on the services list card and the detail page hero. If empty, a gradient is used.
          </p>
          <ImageUpload value={form.coverImage} onChange={(url) => setForm({ ...form, coverImage: url })} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <div className="flex flex-wrap gap-1.5">
            {form.features.map((f) => (
              <Badge key={f} variant="secondary" className="gap-1">
                {f}
                <button type="button" onClick={() => setForm({ ...form, features: form.features.filter((x) => x !== f) })}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              placeholder="Add a feature"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (featureInput.trim() && !form.features.includes(featureInput.trim())) {
                    setForm({ ...form, features: [...form.features, featureInput.trim()] });
                    setFeatureInput("");
                  }
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (featureInput.trim() && !form.features.includes(featureInput.trim())) {
                  setForm({ ...form, features: [...form.features, featureInput.trim()] });
                  setFeatureInput("");
                }
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Detail page content</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          <p className="text-sm text-muted-foreground">
            Optional long-form content for &ldquo;See more detail&rdquo;. If empty, the short description is shown on the detail page.
          </p>
          <RichTextEditor
            content={form.detailContent}
            onChange={(detailContent) => setForm({ ...form, detailContent })}
            placeholder="Extended overview, process, pricing notes, case highlights…"
          />
        </CardContent>
      </Card>
    </AdminForm>
  );
}
