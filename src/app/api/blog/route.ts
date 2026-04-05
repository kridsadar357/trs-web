import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
    });
    return NextResponse.json(posts);
  } catch (e) {
    console.error("GET /api/blog", e);
    return NextResponse.json([]);
  }
}
