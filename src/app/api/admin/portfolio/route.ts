import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.portfolioItem.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.technologies && typeof body.technologies === "string") {
      body.technologies = body.technologies.split(",").map((s: string) => s.trim()).filter(Boolean);
    }
    if (body.gallery && typeof body.gallery === "string") {
      body.gallery = JSON.parse(body.gallery);
    }
    if (body.completedAt === "" || body.completedAt === undefined) {
      body.completedAt = null;
    }
    const item = await prisma.portfolioItem.create({ data: body });
    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "A portfolio item with this slug already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create portfolio item" }, { status: 500 });
  }
}
