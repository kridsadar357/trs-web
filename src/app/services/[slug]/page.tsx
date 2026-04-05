import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ServiceDetailClient } from "./service-detail-client";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = await prisma.service.findFirst({ where: { slug, published: true } });
  if (!s) return { title: "Service" };
  return {
    title: `${s.title} | Services`,
    description: s.description.length > 160 ? `${s.description.slice(0, 157)}…` : s.description,
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = await prisma.service.findFirst({ where: { slug, published: true } });
  if (!service) notFound();

  return (
    <ServiceDetailClient
      service={{
        title: service.title,
        slug: service.slug,
        description: service.description,
        coverImage: service.coverImage,
        detailContent: service.detailContent,
        features: service.features,
      }}
    />
  );
}
