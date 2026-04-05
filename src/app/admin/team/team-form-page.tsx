"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AdminForm } from "@/components/admin/admin-form";
import { ImageUpload } from "@/components/admin/image-upload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function TeamFormPage() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditing = !!editId;

  const [form, setForm] = useState({
    name: "",
    role: "",
    bio: "",
    imageUrl: "",
    email: "",
    linkedin: "",
    twitter: "",
    order: 0,
    published: true,
  });

  useEffect(() => {
    if (editId) {
      fetch(`/api/admin/team/${editId}`)
        .then((r) => r.json())
        .then((data) => {
          setForm({
            name: data.name || "",
            role: data.role || "",
            bio: data.bio || "",
            imageUrl: data.imageUrl || "",
            email: data.email || "",
            linkedin: data.linkedin || "",
            twitter: data.twitter || "",
            order: data.order || 0,
            published: data.published ?? true,
          });
        });
    }
  }, [editId]);

  const handleSave = async () => {
    const url = isEditing ? `/api/admin/team/${editId}` : "/api/admin/team";
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
    await fetch(`/api/admin/team/${editId}`, { method: "DELETE" });
  };

  return (
    <AdminForm
      title={isEditing ? "Edit Team Member" : "New Team Member"}
      backHref="/admin/team"
      onSave={handleSave}
      onDelete={isEditing ? handleDelete : undefined}
      initialData={isEditing ? form : undefined}
    >
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label>Role *</Label>
              <Input
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="Lead Developer"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Brief bio..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Profile Photo</Label>
            <ImageUpload
              value={form.imageUrl}
              onChange={(url) => setForm({ ...form, imageUrl: url })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="john@trs.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Display Order</Label>
              <Input
                type="number"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>LinkedIn URL</Label>
              <Input
                value={form.linkedin}
                onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            <div className="space-y-2">
              <Label>Twitter URL</Label>
              <Input
                value={form.twitter}
                onChange={(e) => setForm({ ...form, twitter: e.target.value })}
                placeholder="https://twitter.com/..."
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
            <span className="text-sm">Published (visible on website)</span>
          </label>
        </CardContent>
      </Card>
    </AdminForm>
  );
}
