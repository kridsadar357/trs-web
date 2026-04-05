"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Calendar, User, ArrowRight, Clock } from "lucide-react";
import { formatBlogDate } from "@/lib/format-blog-date";
import { estimateReadMinutes, excerptFromPost, gradientAt } from "@/lib/cms-display";
import { cn } from "@/lib/utils";

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  featured: boolean;
  gradient: string;
  coverImage?: string | null;
};

type BlogApiPost = {
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  category: string | null;
  authorName: string | null;
  publishedAt: string | null;
  createdAt: string;
  featured: boolean;
  coverImage: string | null;
};

function FeaturedHeroMedia({
  post,
  priorityImage,
  children,
}: {
  post: Post;
  priorityImage?: boolean;
  children: ReactNode;
}) {
  if (post.coverImage) {
    return (
      <div className="relative h-56 w-full overflow-hidden sm:h-64">
        <Image
          src={post.coverImage}
          alt=""
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={priorityImage}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/25" aria-hidden />
        <div className="absolute inset-0 flex flex-col justify-between p-6">{children}</div>
      </div>
    );
  }
  return (
    <div
      className={cn(
        "flex h-56 flex-col justify-between bg-gradient-to-br p-6 sm:h-64",
        post.gradient,
      )}
    >
      {children}
    </div>
  );
}

function LatestCardMedia({ post }: { post: Post }) {
  if (post.coverImage) {
    return (
      <div className="relative h-40 w-full overflow-hidden">
        <Image
          src={post.coverImage}
          alt=""
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" aria-hidden />
      </div>
    );
  }
  return <div className={cn("h-36 w-full bg-gradient-to-br", post.gradient)} aria-hidden />;
}

export function BlogPageClient() {
  const { t, i18n } = useTranslation();
  const raw = t("pages.blogPage.posts", { returnObjects: true });
  const fallback = Array.isArray(raw) ? (raw as Post[]) : [];

  const [loading, setLoading] = useState(true);
  const [apiPosts, setApiPosts] = useState<BlogApiPost[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/blog", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: unknown) => {
        if (cancelled) return;
        if (Array.isArray(data)) setApiPosts(data as BlogApiPost[]);
      })
      .catch(() => {
        if (!cancelled) setApiPosts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const posts: Post[] =
    apiPosts.length > 0
      ? apiPosts.map((p, i) => {
          const dateIso = p.publishedAt || p.createdAt;
          const mins = estimateReadMinutes(p.content);
          return {
            slug: p.slug,
            title: p.title,
            excerpt: excerptFromPost(p.excerpt, p.content),
            category: p.category || "",
            author: p.authorName || "TRS",
            date: dateIso,
            readTime: t("pages.blogPost.readTimeMins", { mins }),
            featured: p.featured,
            gradient: gradientAt(i),
            coverImage: p.coverImage?.trim() || null,
          };
        })
      : fallback;

  const heroPosts = useMemo(() => {
    const featured = posts.filter((p) => p.featured);
    if (featured.length > 0) return featured;
    return posts.length > 0 ? [posts[0]!] : [];
  }, [posts]);

  const heroSlugs = useMemo(() => new Set(heroPosts.map((p) => p.slug)), [heroPosts]);

  const latestPosts = useMemo(() => posts.filter((p) => !heroSlugs.has(p.slug)), [posts, heroSlugs]);

  return (
    <>
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-4">
              {t("pages.blogPage.badge")}
            </Badge>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold">
              {t("pages.blogPage.titleBefore")}{" "}
              <span className="gradient-text">{t("pages.blogPage.titleHighlight")}</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">{t("pages.blogPage.intro")}</p>
          </div>
        </div>
      </section>

      <section className="pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {loading && apiPosts.length === 0 && fallback.length === 0 ? (
              <>
                {[0, 1].map((i) => (
                  <Card key={i} className="overflow-hidden animate-pulse">
                    <div className="h-56 bg-muted sm:h-64" />
                    <CardContent className="space-y-3 p-6">
                      <div className="h-5 w-2/3 rounded bg-muted" />
                      <div className="h-3 w-full rounded bg-muted" />
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : (
              heroPosts.map((post, idx) => (
                <Card
                  key={post.slug}
                  className="group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <FeaturedHeroMedia post={post} priorityImage={idx === 0}>
                    <Badge variant="secondary" className="w-fit border-0 bg-white/20 text-white">
                      {post.category || "—"}
                    </Badge>
                    <div className="flex items-center gap-4 text-xs text-white/85">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 shrink-0" /> {formatBlogDate(post.date, i18n.language)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 shrink-0" /> {post.readTime}
                      </span>
                    </div>
                  </FeaturedHeroMedia>
                  <CardContent className="p-6">
                    <h2 className="mb-2 font-heading text-xl font-semibold transition-colors group-hover:text-primary">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h2>
                    <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <User className="h-3 w-3 shrink-0" /> {post.author}
                      </span>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="flex items-center gap-1 text-xs font-medium text-primary transition-all hover:gap-2"
                      >
                        {t("pages.blogPage.readMore")} <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {(!loading || apiPosts.length > 0 || fallback.length > 0) && latestPosts.length > 0 ? (
        <section className="pb-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 font-heading text-2xl font-bold">{t("pages.blogPage.latest")}</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {loading && apiPosts.length === 0 && fallback.length === 0 ? (
                <>
                  {[0, 1, 2].map((i) => (
                    <Card key={i} className="animate-pulse overflow-hidden">
                      <div className="h-40 bg-muted" />
                      <CardContent className="space-y-3 p-6">
                        <div className="h-3 w-1/3 rounded bg-muted" />
                        <div className="h-4 w-4/5 rounded bg-muted" />
                        <div className="h-12 w-full rounded bg-muted" />
                      </CardContent>
                    </Card>
                  ))}
                </>
              ) : (
                latestPosts.map((post) => (
                  <Card
                    key={post.slug}
                    className="group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <LatestCardMedia post={post} />
                    <CardContent className="p-6">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {post.category || "—"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{post.readTime}</span>
                      </div>
                      <h3 className="mb-2 font-heading font-semibold transition-colors group-hover:text-primary">
                        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                      </h3>
                      <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3 shrink-0" /> {post.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 shrink-0" /> {formatBlogDate(post.date, i18n.language)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
