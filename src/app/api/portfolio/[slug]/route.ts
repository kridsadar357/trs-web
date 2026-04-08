import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugParamCandidates } from "@/lib/portfolio-slug";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Props) {
  try {
    const { slug } = await params;
    const candidates = slugParamCandidates(slug);
    const item = await prisma.portfolioItem.findFirst({
      where: { slug: { in: candidates }, published: true },
    });
    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
