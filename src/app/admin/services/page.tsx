"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Service {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string | null;
  icon: string | null;
  order: number;
  published: boolean;
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    fetch("/api/admin/services")
      .then((r) => r.json())
      .then((data: unknown) => {
        if (Array.isArray(data)) setServices(data as Service[]);
      });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("ลบบริการนี้หรือไม่?")) return;
    await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
    setServices(services.filter((s) => s.id !== id));
  };

  return (
    <div className="max-w-full">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">บริการ</h1>
          <p className="mt-1 text-sm text-muted-foreground">จัดการรายการบริการและหน้ารายละเอียด</p>
        </div>
        <Link href="/admin/services/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> เพิ่มบริการ
          </Button>
        </Link>
      </div>

      <div className="w-full max-w-full overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <table className="w-full table-fixed border-collapse text-left text-sm">
          <colgroup>
            <col className="w-10" />
            <col className="w-14" />
            <col className="w-[18%]" />
            <col className="w-[14%]" />
            <col />
            <col className="w-24" />
            <col className="w-[5.5rem]" />
          </colgroup>
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                #
              </th>
              <th className="px-2 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                รูป
              </th>
              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                ชื่อ
              </th>
              <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Slug
              </th>
              <th className="min-w-0 px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                คำอธิบายสั้น
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
            {services.map((service) => (
              <tr key={service.id} className="border-b border-border/80 transition-colors hover:bg-muted/30">
                <td className="px-2 py-3 text-center align-top text-muted-foreground">{service.order + 1}</td>
                <td className="px-2 py-3 align-top">
                  <div
                    className={cn(
                      "relative mx-auto h-11 w-11 overflow-hidden rounded-md border border-border/80 bg-muted",
                      !service.coverImage && "flex items-center justify-center"
                    )}
                  >
                    {service.coverImage ? (
                      <Image
                        src={service.coverImage}
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
                  <span className="break-words font-medium leading-snug">{service.title}</span>
                </td>
                <td className="min-w-0 px-3 py-3 align-top">
                  <code className="break-all text-xs text-muted-foreground">{service.slug}</code>
                </td>
                <td className="min-w-0 max-w-0 px-3 py-3 align-top">
                  <p className="break-words text-muted-foreground leading-relaxed">{service.description}</p>
                </td>
                <td className="px-2 py-3 align-top text-center">
                  <Badge variant={service.published ? "default" : "outline"} className="whitespace-nowrap text-xs">
                    {service.published ? "เผยแพร่" : "ฉบับร่าง"}
                  </Badge>
                </td>
                <td className="px-1 py-2 align-top">
                  <div className="flex justify-end gap-0.5">
                    <Link href={`/admin/services/${service.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" title="แก้ไข">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                      title="ลบ"
                      onClick={() => handleDelete(service.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {services.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">ยังไม่มีบริการ — กดเพิ่มบริการเพื่อเริ่มต้น</div>
        )}
      </div>
    </div>
  );
}
