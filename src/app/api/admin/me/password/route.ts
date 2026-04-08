import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireSignedInSession } from "@/lib/require-session";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  const session = await requireSignedInSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id?: string }).id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = (await request.json()) as { currentPassword?: string; newPassword?: string };
    const currentPassword = body.currentPassword || "";
    const newPassword = body.newPassword || "";

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "กรอกรหัสผ่านปัจจุบันและรหัสใหม่" }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "รหัสผ่านใหม่อย่างน้อย 8 ตัวอักษร" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.password) {
      return NextResponse.json({ error: "บัญชีนี้เปลี่ยนรหัสผ่านผ่านระบบนี้ไม่ได้" }, { status: 400 });
    }

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) {
      return NextResponse.json({ error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" }, { status: 400 });
    }

    const hash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: userId }, data: { password: hash } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("PATCH /api/admin/me/password", e);
    return NextResponse.json({ error: "เปลี่ยนรหัสผ่านไม่สำเร็จ" }, { status: 500 });
  }
}
