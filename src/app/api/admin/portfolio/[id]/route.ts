import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await prisma.portfolioItem.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    if (body.technologies && typeof body.technologies === "string") {
      body.technologies = body.technologies.split(",").map((s: string) => s.trim()).filter(Boolean);
    }
    if (body.gallery && typeof body.gallery === "string") {
      body.gallery = JSON.parse(body.gallery);
    }
    // Empty date input sends ""; Prisma DateTime rejects that — use null to clear optional date
    if (body.completedAt === "" || body.completedAt === undefined) {
      body.completedAt = null;
    }
    const item = await prisma.portfolioItem.update({ where: { id }, data: body });
    return NextResponse.json(item);
  } catch (e: unknown) {
    const code = typeof e === "object" && e !== null && "code" in e ? (e as { code: string }).code : "";
    if (code === "P2002") {
      return NextResponse.json({ error: "A portfolio item with this slug already exists" }, { status: 409 });
    }
    console.error("portfolio PUT", e);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.portfolioItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
