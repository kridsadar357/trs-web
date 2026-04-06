import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const data: { displayName?: string; active?: boolean; password?: string } = {};

    if (typeof body.displayName === "string") {
      data.displayName = body.displayName.trim().slice(0, 255);
    }
    if (typeof body.active === "boolean") {
      data.active = body.active;
    }
    if (typeof body.password === "string" && body.password.length > 0) {
      data.password = await bcrypt.hash(body.password, 12);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No changes" }, { status: 400 });
    }

    const agent = await prisma.supportAgent.update({
      where: { id },
      data,
      select: {
        id: true,
        username: true,
        displayName: true,
        active: true,
        updatedAt: true,
      },
    });
    return NextResponse.json(agent);
  } catch (e: unknown) {
    const code = typeof e === "object" && e !== null && "code" in e ? (e as { code: string }).code : "";
    console.error("PATCH chat-agent", e);
    if (code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    await prisma.supportAgent.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const code = typeof e === "object" && e !== null && "code" in e ? (e as { code: string }).code : "";
    if (code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    console.error("DELETE chat-agent", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
