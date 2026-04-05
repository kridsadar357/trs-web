"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminForm } from "@/components/admin/admin-form";
import { ImageUpload } from "@/components/admin/image-upload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

export default function TestimonialFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditing = !!editId;

  const [form, setForm] = useState({
    name: "",
    role: "",
    company: "",
    content: "",
    imageUrl: "",
    rating: 5,
    featured: false,
    published: true,
  });

  useEffect(() => {
    if (editId) {
      fetch(`/api/admin/testimonials/${editId}`)
        .then((r) => r.json())
        .then((data) => {
          setForm({
            name: data.name || "",
            role: data.role || "",
            company: data.company || "",
            content: data.content || "",
            imageUrl: data.imageUrl || "",
            rating: data.rating || 5,
            featured: data.featured || false,
            published: data.published ?? true,
          });
        });
    }
  }, [editId]);

  const handleSave = async () => {
    const url = isEditing ? `/api/admin/testimonials/${editId}` : "/api/admin/testimonials";
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
    await fetch(`/api/admin/testimonials/${editId}`, { method: "DELETE" });
  };

  return (
    <AdminForm
      title={isEditing ? "Edit Testimonial" : "New Testimonial"}
      backHref="/admin/testimonials"
      onSave={handleSave}
      onDelete={isEditing ? handleDelete : undefined}
      initialData={isEditing ? form : undefined}
    >
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Client name"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="CEO, CTO, etc."
              />
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <Input
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="Company name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Testimonial Content *</Label>
            <Textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="What the client said..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Client Photo</Label>
            <ImageUpload
              value={form.imageUrl}
              onChange={(url) => setForm({ ...form, imageUrl: url })}
            />
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setForm({ ...form, rating: star })}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= form.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Published</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Featured</span>
            </label>
          </div>
        </CardContent>
      </Card>
    </AdminForm>
  );
}
