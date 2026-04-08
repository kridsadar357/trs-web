import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  try {
    const body = (await request.json()) as {
      email?: string;
      name?: string | null;
      role?: string;
      password?: string;
    };

    const email = body.email?.trim().toLowerCase();
    const name = body.name === undefined ? undefined : body.name?.trim() || null;
    const role = body.role?.trim();
    const password = body.password?.trim();

    const data: {
      email?: string;
      name?: string | null;
      role?: string;
      password?: string;
    } = {};
    if (email) data.email = email;
    if (name !== undefined) data.name = name;
    if (role) data.role = role;
    if (password) {
      if (password.length < 8) {
        return NextResponse.json({ error: "รหัสผ่านอย่างน้อย 8 ตัวอักษร" }, { status: 400 });
      }
      data.password = await bcrypt.hash(password, 12);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "ไม่มีข้อมูลที่จะอัปเดต" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
    });
    return NextResponse.json(user);
  } catch (e: unknown) {
    const code = typeof e === "object" && e !== null && "code" in e ? String((e as { code: string }).code) : "";
    if (code === "P2002") {
      return NextResponse.json({ error: "อีเมลนี้มีในระบบแล้ว" }, { status: 409 });
    }
    if (code === "P2025") {
      return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });
    }
    console.error("PUT /api/admin/users/[id]", e);
    return NextResponse.json({ error: "อัปเดตไม่สำเร็จ" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const uid = (session.user as { id?: string }).id;
  if (id === uid) {
    return NextResponse.json({ error: "ไม่สามารถลบบัญชีที่กำลังล็อกอินอยู่" }, { status: 400 });
  }

  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const code = typeof e === "object" && e !== null && "code" in e ? String((e as { code: string }).code) : "";
    if (code === "P2025") {
      return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });
    }
    console.error("DELETE /api/admin/users/[id]", e);
    return NextResponse.json({ error: "ลบไม่สำเร็จ" }, { status: 500 });
  }
}
