import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parsePageCreateBody } from "@/lib/sanitize-page-input";

export async function GET() {
  try {
    const pages = await prisma.page.findMany({ orderBy: { order: "asc" } });
    return NextResponse.json(pages);
  } catch (e) {
    console.error("GET /api/admin/pages", e);
    return NextResponse.json({ error: "Failed to load pages" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const raw = await request.json();
    const data = parsePageCreateBody(raw);
    const page = await prisma.page.create({ data });
    return NextResponse.json(page, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to create page";
    console.error("POST /api/admin/pages", e);
    if (typeof e === "object" && e !== null && "code" in e && (e as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
