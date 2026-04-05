"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
  authorName: string | null;
  published: boolean;
  featured: boolean;
  publishedAt: string | null;
  coverImage: string | null;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    fetch("/api/admin/blog")
      .then((r) => r.json())
      .then((data: unknown) => {
        if (Array.isArray(data)) setPosts(data as BlogPost[]);
      });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("ลบบทความนี้หรือไม่?")) return;
    await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
    setPosts(posts.filter((p) => p.id !== id));
  };

  return (
    <div className="max-w-full">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">บทความ</h1>
          <p className="mt-1 text-sm text-muted-foreground">จัดการบทความและเนื้อหาบล็อก</p>
        </div>
        <Link href="/admin/blog/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> เขียนโพสต์ใหม่
          </Button>
        </Link>
      </div>

      <div className="w-full max-w-full overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <table className="w-full table-fixed border-collapse text-left text-sm">
          <colgroup>
            <col className="w-14" />
            <col className="w-[22%]" />
            <col className="w-[16%]" />
            <col className="w-[12%]" />
            <col className="w-[12%]" />
            <col />
            <col className="w-24" />
            <col className="w-[5.5rem]" />
          </colgroup>
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-2 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                รูป
              </th>
              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                หัวข้อ
              </th>
              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Slug
              </th>
              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                หมวด
              </th>
              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                ผู้เขียน
              </th>
              <th className="min-w-0 px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                สรุป
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
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-border/80 transition-colors hover:bg-muted/30">
                <td className="px-2 py-3 align-top">
                  <div
                    className={cn(
                      "relative mx-auto h-11 w-11 overflow-hidden rounded-md border border-border/80 bg-muted",
                      !post.coverImage && "flex items-center justify-center"
                    )}
                  >
                    {post.coverImage ? (
                      <Image
                        src={post.coverImage}
                        alt=""
                        width={44}
                        height={44}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-[10px] text-muted-foreground">—</span>
                    )}
                  </div>
                </td>
                <td className="min-w-0 px-3 py-3 align-top">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="break-words font-medium leading-snug">{post.title}</span>
                    {post.featured ? (
                      <Badge variant="secondary" className="shrink-0 text-[10px]">
                        Featured
                      </Badge>
                    ) : null}
                  </div>
                  {post.publishedAt ? (
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {new Date(post.publishedAt).toLocaleDateString()}
                    </p>
                  ) : null}
                </td>
                <td className="min-w-0 px-3 py-3 align-top">
                  <code className="break-all text-xs text-muted-foreground">{post.slug}</code>
                </td>
                <td className="min-w-0 px-3 py-3 align-top">
                  <span className="break-words text-muted-foreground">{post.category || "—"}</span>
                </td>
                <td className="min-w-0 px-3 py-3 align-top">
                  <span className="break-words text-muted-foreground">{post.authorName || "—"}</span>
                </td>
                <td className="min-w-0 max-w-0 px-3 py-3 align-top">
                  <p className="break-words text-muted-foreground leading-relaxed line-clamp-3">
                    {post.excerpt || "—"}
                  </p>
                </td>
                <td className="px-2 py-3 align-top text-center">
                  <Badge variant={post.published ? "default" : "outline"} className="whitespace-nowrap text-xs">
                    {post.published ? "เผยแพร่" : "ฉบับร่าง"}
                  </Badge>
                </td>
                <td className="px-1 py-2 align-top">
                  <div className="flex justify-end gap-0.5">
                    <Link href={`/admin/blog/${post.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" title="แก้ไข">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                      title="ลบ"
                      onClick={() => handleDelete(post.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {posts.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">ยังไม่มีบทความ — เขียนโพสต์แรกของคุณ</div>
        )}
      </div>
    </div>
  );
}
