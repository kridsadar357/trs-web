import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const agents = await prisma.supportAgent.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        username: true,
        displayName: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return NextResponse.json(agents);
  } catch (e) {
    console.error("GET /api/admin/chat-agents", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const username = typeof body.username === "string" ? body.username.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const displayName = typeof body.displayName === "string" ? body.displayName.trim().slice(0, 255) : "";
    if (!username || !password || !displayName) {
      return NextResponse.json({ error: "username, password, displayName required" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const agent = await prisma.supportAgent.create({
      data: { username, password: hashed, displayName, active: true },
      select: {
        id: true,
        username: true,
        displayName: true,
        active: true,
        createdAt: true,
      },
    });
    return NextResponse.json(agent, { status: 201 });
  } catch (e: unknown) {
    const code = typeof e === "object" && e !== null && "code" in e ? (e as { code: string }).code : "";
    console.error("POST /api/admin/chat-agents", e);
    if (code === "P2002") {
      return NextResponse.json({ error: "Username already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
