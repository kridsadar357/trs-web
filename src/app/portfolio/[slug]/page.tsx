import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { slugParamCandidates } from "@/lib/portfolio-slug";
import { PortfolioDetailClient } from "./portfolio-detail-client";

type Props = { params: Promise<{ slug: string }> };

async function findPublishedBySlugParam(rawSlug: string) {
  const candidates = slugParamCandidates(rawSlug);
  return prisma.portfolioItem.findFirst({
    where: { published: true, slug: { in: candidates } },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await findPublishedBySlugParam(slug);
  if (!p) return { title: "Portfolio" };
  const desc = p.description.length > 160 ? `${p.description.slice(0, 157)}…` : p.description;
  return {
    title: `${p.title} | Portfolio`,
    description: desc,
    openGraph: { title: p.title, description: desc },
  };
}

export default async function PortfolioDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = await findPublishedBySlugParam(slug);
  if (!item) notFound();

  return (
    <PortfolioDetailClient
      item={{
        title: item.title,
        slug: item.slug,
        description: item.description,
        content: item.content,
        client: item.client,
        category: item.category,
        technologies: item.technologies,
        imageUrl: item.imageUrl,
        gallery: item.gallery,
        completedAt: item.completedAt?.toISOString() ?? null,
      }}
    />
  );
}
