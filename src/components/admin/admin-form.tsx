"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Trash2 } from "lucide-react";

interface AdminFormProps {
  title: string;
  backHref: string;
  onSave: (data: any) => Promise<void>;
  onDelete?: () => Promise<void>;
  children: React.ReactNode;
  initialData?: any;
  /** Wider main column for grids (e.g. portfolio two-column form) */
  wideLayout?: boolean;
}

export function AdminForm({ title, backHref, onSave, onDelete, children, initialData, wideLayout }: AdminFormProps) {
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const isEditing = !!initialData;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSave({});
      router.push(backHref);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้? การลบไม่สามารถย้อนกลับได้")) return;
    setDeleting(true);
    try {
      await onDelete?.();
      router.push(backHref);
      router.refresh();
    } catch {
      setError("ลบไม่สำเร็จ");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <a href={backHref} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </a>
          <h1 className="font-heading text-xl font-bold">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {isEditing && onDelete && (
            <Button type="button" variant="destructive" size="sm" onClick={handleDelete} disabled={deleting} className="gap-1">
              <Trash2 className="h-4 w-4" />
              {deleting ? "กำลังลบ..." : "ลบ"}
            </Button>
          )}
          <Button type="button" size="sm" disabled={saving} className="gap-1" onClick={handleSave}>
            <Save className="h-4 w-4" />
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>
      )}

      <form onSubmit={handleSave}>
        <div className={wideLayout ? "mx-auto w-full max-w-7xl space-y-6" : "mx-auto max-w-3xl space-y-6"}>
          {children}
        </div>
      </form>
    </div>
  );
}
