"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import {
  FileText,
  Briefcase,
  FolderOpen,
  Users,
  Star,
  Mail,
  Plus,
} from "lucide-react";

export default function AdminDashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold">แดชบอร์ด</h1>
        <p className="text-muted-foreground text-sm mt-1">
          ยินดีต้อนรับกลับมา จัดการเว็บไซต์ของคุณจากเมนูด้านซ้าย หรือใช้ปุ่มลัดด้านล่าง
        </p>
      </div>

      <div className="mt-8">
        <h2 className="font-heading text-lg font-semibold mb-4">คำสั่งด่วน</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/admin/blog/new">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">บทความใหม่</p>
                  <p className="text-xs text-muted-foreground">เขียนบทความใหม่</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/portfolio/new">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
                  <FolderOpen className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">เพิ่มผลงาน</p>
                  <p className="text-xs text-muted-foreground">แสดงผลงานใหม่</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/services/new">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">เพิ่มบริการ</p>
                  <p className="text-xs text-muted-foreground">สร้างบริการใหม่</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/team/new">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500/10 text-pink-500">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">เพิ่มสมาชิกทีม</p>
                  <p className="text-xs text-muted-foreground">เพิ่มในหน้าทีมงาน</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/testimonials/new">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                  <Star className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">เพิ่มรีวิวลูกค้า</p>
                  <p className="text-xs text-muted-foreground">คำรีวิวจากลูกค้า</p>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/contacts">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">ดูข้อความ</p>
                  <p className="text-xs text-muted-foreground">รายการติดต่อจากหน้าเว็บ</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
