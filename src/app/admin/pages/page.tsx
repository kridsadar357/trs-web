"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

type PageRow = {
  id: string;
  slug: string;
  title: string;
  heroImage: string | null;
  metaDescription: string | null;
  published: boolean;
  order: number;
};

function publicUrlForSlug(slug: string) {
  const s = slug.replace(/^\//, "");
  if (s === "" || s === "home") return "/";
  return `/${s}`;
}

export default function AdminPagesListPage() {
  const [pages, setPages] = useState<PageRow[]>([]);

  useEffect(() => {
    fetch("/api/admin/pages")
      .then((r) => r.json())
      .then((data: unknown) => {
        if (Array.isArray(data)) setPages(data as PageRow[]);
      });
  }, []);

  const handleDelete = async (row: PageRow) => {
    if (!confirm(`ลบหน้า "${row.title}" หรือไม่?`)) return;
    const res = await fetch(`/api/admin/pages/${row.id}`, { method: "DELETE" });
    if (!res.ok) {
      alert("ลบไม่สำเร็จ");
      return;
    }
    setPages(pages.filter((p) => p.id !== row.id));
  };

  return (
    <div className="max-w-full">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">หน้าเว็บไซต์</h1>
          <p className="mt-1 text-sm text-muted-foreground">จัดการหน้า CMS — แก้ไขเนื้อหา Meta และ Hero</p>
        </div>
        <Link href="/admin/pages/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> เพิ่มหน้า
          </Button>
        </Link>
      </div>

      <div className="w-full max-w-full overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <table className="w-full table-fixed border-collapse text-left text-sm">
          <colgroup>
            <col className="w-10" />
            <col className="w-14" />
            <col className="w-[20%]" />
            <col className="w-[14%]" />
            <col />
            <col className="w-24" />
            <col className="w-[7.5rem]" />
          </colgroup>
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                #
              </th>
              <th className="px-2 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">รูป</th>
              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">ชื่อ</th>
              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Slug</th>
              <th className="min-w-0 px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Meta / หมายเหตุ
              </th>
              <th className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                สถานะ
              </th>
              <th className="px-2 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                จัดการ
              </th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.id} className="border-b border-border/80 transition-colors hover:bg-muted/30">
                <td className="px-2 py-3 text-center align-top text-muted-foreground">{page.order + 1}</td>
                <td className="px-2 py-3 align-top">
                  <div
                    className={cn(
                      "relative mx-auto h-11 w-11 overflow-hidden rounded-md border border-border/80 bg-muted",
                      !page.heroImage && "flex items-center justify-center",
                    )}
                  >
                    {page.heroImage ? (
                      <Image src={page.heroImage} alt="" width={44} height={44} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-muted-foreground">—</span>
                    )}
                  </div>
                </td>
                <td className="min-w-0 px-3 py-3 align-top">
                  <span className="break-words font-medium leading-snug">{page.title}</span>
                </td>
                <td className="min-w-0 px-3 py-3 align-top">
                  <code className="break-all text-xs text-muted-foreground">/{page.slug}</code>
                </td>
                <td className="min-w-0 max-w-0 px-3 py-3 align-top">
                  <p className="line-clamp-2 break-words text-muted-foreground leading-relaxed">
                    {page.metaDescription?.trim() || "—"}
                  </p>
                </td>
                <td className="px-2 py-3 align-top text-center">
                  <Badge variant={page.published ? "default" : "outline"} className="whitespace-nowrap text-xs">
                    {page.published ? "เผยแพร่" : "ฉบับร่าง"}
                  </Badge>
                </td>
                <td className="px-1 py-2 align-top">
                  <div className="flex flex-wrap justify-end gap-0.5">
                    <a
                      href={publicUrlForSlug(page.slug)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="ดูหน้าเว็บ"
                      className={cn(
                        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                      )}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <Link href={`/admin/pages/${page.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" title="แก้ไข">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                      title="ลบ"
                      onClick={() => handleDelete(page)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pages.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">ยังไม่มีหน้า — กดเพิ่มหน้าเพื่อเริ่มต้น</div>
        )}
      </div>
    </div>
  );
}
