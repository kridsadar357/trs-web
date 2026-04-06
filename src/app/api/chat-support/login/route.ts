import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { COOKIE_NAME, signSupportAgentToken } from "@/lib/chat-support-jwt";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = typeof body.username === "string" ? body.username.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    const agent = await prisma.supportAgent.findUnique({
      where: { username },
    });
    if (!agent || !agent.active) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, agent.password);
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await signSupportAgentToken(agent.id);
    const res = NextResponse.json({
      ok: true,
      displayName: agent.displayName,
    });
    const secure = process.env.NODE_ENV === "production";
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (e) {
    console.error("POST /api/chat-support/login", e);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
