"use client";

import { useTranslation } from "react-i18next";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Clock, ArrowLeft } from "lucide-react";
import { formatBlogDate } from "@/lib/format-blog-date";
import { estimateReadMinutes, excerptFromPost, stringArrayFromJson } from "@/lib/cms-display";
import { RteHtmlWithLightbox } from "@/components/content/rte-html-with-lightbox";
import { cn } from "@/lib/utils";

export type BlogPostPayload = {
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  category: string | null;
  authorName: string | null;
  publishedAt: string | null;
  createdAt: string;
  coverImage: string | null;
  tags: unknown;
};

export function BlogPostClient({ post }: { post: BlogPostPayload }) {
  const { t, i18n } = useTranslation();
  const dateIso = post.publishedAt || post.createdAt;
  const mins = estimateReadMinutes(post.content);
  const lead = excerptFromPost(post.excerpt, post.content);
  const tags = stringArrayFromJson(post.tags);

  return (
    <article>
      <section className="relative border-b border-border/60">
        <div className="relative min-h-[280px] w-full sm:min-h-[320px]">
          {post.coverImage ? (
            <>
              <Image
                src={post.coverImage}
                alt=""
                fill
                priority
                className="object-cover"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/30" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-violet-600/80 to-indigo-900" />
          )}
          <div
            className={cn(
              "relative flex flex-col justify-end px-4 pb-12 pt-28 sm:px-6 lg:px-8",
              !post.coverImage && "text-white [&_a:hover]:text-white"
            )}
          >
            <div className="container mx-auto max-w-3xl">
              <Link
                href="/blog"
                className={cn(
                  "mb-6 inline-flex items-center gap-2 text-sm transition-colors",
                  post.coverImage
                    ? "text-muted-foreground hover:text-primary"
                    : "text-white/80 hover:text-white"
                )}
              >
                <ArrowLeft className="h-4 w-4" /> {t("pages.blogPost.back")}
              </Link>
              {post.category ? (
                <Badge variant="secondary" className={cn("mb-4", !post.coverImage && "border-0 bg-white/20 text-white")}>
                  {post.category}
                </Badge>
              ) : null}
              <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">{post.title}</h1>
              {lead ? (
                <p
                  className={cn(
                    "mt-4 max-w-2xl text-lg leading-relaxed",
                    post.coverImage ? "text-muted-foreground" : "text-white/90"
                  )}
                >
                  {lead}
                </p>
              ) : null}
              <div
                className={cn(
                  "mt-6 flex flex-wrap items-center gap-4 text-sm",
                  post.coverImage ? "text-muted-foreground" : "text-white/85"
                )}
              >
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" /> {post.authorName || "TRS"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" /> {formatBlogDate(dateIso, i18n.language)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" /> {t("pages.blogPost.readTimeMins", { mins })}
                </span>
              </div>
              {tags.length > 0 ? (
                <div className="mt-6 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="font-normal">
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <RteHtmlWithLightbox
            html={post.content}
            className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-heading prose-a:text-primary"
          />
        </div>
      </section>
    </article>
  );
}
