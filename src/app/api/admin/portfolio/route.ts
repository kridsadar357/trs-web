import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sanitizePortfolioBody } from "@/lib/portfolio-sanitize";

export async function GET() {
  const items = await prisma.portfolioItem.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  try {
    const raw = await request.json();
    const data = sanitizePortfolioBody(raw);
    const item = await prisma.portfolioItem.create({ data });
    return NextResponse.json(item, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to create portfolio item";
    if (msg === "Invalid request body" || msg.includes("required")) {
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    const code = typeof e === "object" && e !== null && "code" in e ? String((e as { code: string }).code) : "";
    if (code === "P2002") {
      return NextResponse.json({ error: "Slug นี้ถูกใช้แล้ว กรุณาเปลี่ยน slug" }, { status: 409 });
    }
    console.error("POST /api/admin/portfolio", e);
    return NextResponse.json({ error: "Failed to create portfolio item" }, { status: 500 });
  }
}
