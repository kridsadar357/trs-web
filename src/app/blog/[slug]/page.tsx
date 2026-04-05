import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { excerptFromPost } from "@/lib/cms-display";
import { BlogPostClient } from "./blog-post-client";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findFirst({ where: { slug, published: true } });
  if (!post) return { title: "Blog" };
  const description = excerptFromPost(post.excerpt, post.content);
  return {
    title: `${post.title} | TRS Blog`,
    description: description || undefined,
    openGraph: {
      title: post.title,
      description: description || undefined,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await prisma.blogPost.findFirst({ where: { slug, published: true } });
  if (!post) notFound();

  return (
    <BlogPostClient
      post={{
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        category: post.category,
        authorName: post.authorName,
        publishedAt: post.publishedAt?.toISOString() ?? null,
        createdAt: post.createdAt.toISOString(),
        coverImage: post.coverImage,
        tags: post.tags,
      }}
    />
  );
}
