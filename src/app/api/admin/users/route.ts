import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
  });
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
      name?: string;
      role?: string;
    };
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const password = body.password;
    const name = body.name?.trim() || null;
    const role = (body.role || "admin").trim() || "admin";

    if (!email || !password) {
      return NextResponse.json({ error: "อีเมลและรหัสผ่านจำเป็น" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "รหัสผ่านอย่างน้อย 8 ตัวอักษร" }, { status: 400 });
    }

    const hash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password: hash, name, role },
      select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
    });
    return NextResponse.json(user, { status: 201 });
  } catch (e: unknown) {
    const code = typeof e === "object" && e !== null && "code" in e ? String((e as { code: string }).code) : "";
    if (code === "P2002") {
      return NextResponse.json({ error: "อีเมลนี้มีในระบบแล้ว" }, { status: 409 });
    }
    console.error("POST /api/admin/users", e);
    return NextResponse.json({ error: "สร้างผู้ใช้ไม่สำเร็จ" }, { status: 500 });
  }
}
