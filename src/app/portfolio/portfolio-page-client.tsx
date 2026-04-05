"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { CTASection } from "@/components/sections/cta-section";
import { ArrowRight } from "lucide-react";
import { gradientAt, stringArrayFromJson } from "@/lib/cms-display";
import { cn } from "@/lib/utils";

type Project = {
  id?: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  tags: string[];
  gradient: string;
  client: string;
  imageUrl?: string | null;
  featured: boolean;
  fromApi: boolean;
};

type PortfolioApiItem = {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string | null;
  client: string | null;
  technologies: unknown;
  imageUrl: string | null;
  featured?: boolean;
};

export function PortfolioPageClient() {
  const { t } = useTranslation();
  const raw = t("pages.portfolioProjects", { returnObjects: true });
  type FallbackRow = {
    title: string;
    slug: string;
    category: string;
    description: string;
    tags: string[];
    gradient: string;
    client: string;
  };
  const fallback: Project[] = Array.isArray(raw)
    ? (raw as FallbackRow[]).map((p) => ({
        title: p.title,
        slug: p.slug,
        category: p.category || "",
        description: p.description,
        tags: Array.isArray(p.tags) ? p.tags : [],
        gradient: p.gradient || "from-primary to-blue-600",
        client: p.client || "—",
        imageUrl: null,
        featured: false,
        fromApi: false,
      }))
    : [];

  const [loading, setLoading] = useState(true);
  const [apiItems, setApiItems] = useState<PortfolioApiItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/portfolio", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: unknown) => {
        if (cancelled) return;
        if (Array.isArray(data)) setApiItems(data as PortfolioApiItem[]);
      })
      .catch(() => {
        if (!cancelled) setApiItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const allProjects: Project[] = useMemo(() => {
    if (apiItems.length > 0) {
      const mapped = apiItems.map((item, i) => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        category: item.category || "",
        description: item.description,
        tags: stringArrayFromJson(item.technologies),
        gradient: gradientAt(i),
        client: item.client || "—",
        imageUrl: item.imageUrl,
        featured: Boolean(item.featured),
        fromApi: true as const,
      }));
      return [...mapped].sort((a, b) => Number(b.featured) - Number(a.featured));
    }
    return fallback;
  }, [apiItems, fallback]);

  return (
    <>
      <section className="relative overflow-hidden border-b border-border/50 bg-gradient-to-b from-muted/30 to-background pb-16 pt-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.25]"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--border) / 0.6) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--border) / 0.6) 1px, transparent 1px)
            `,
            backgroundSize: "44px 44px",
          }}
        />
        <div className="relative container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Badge variant="secondary" className="mb-4">
            {t("pages.portfolioPage.badge")}
          </Badge>
          <h1 className="max-w-3xl font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            {t("pages.portfolioPage.titleBefore")}{" "}
            <span className="gradient-text">{t("pages.portfolioPage.titleHighlight")}</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {t("pages.portfolioPage.intro")}
          </p>
        </div>
      </section>

      <section className="py-16 lg:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading && apiItems.length === 0 && fallback.length === 0 ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-border/60 bg-card">
                  <div className="aspect-[5/4] bg-muted" />
                  <div className="space-y-3 p-6">
                    <div className="h-4 w-1/3 rounded bg-muted" />
                    <div className="h-6 w-3/4 rounded bg-muted" />
                    <div className="h-3 w-full rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-12 lg:gap-6">
              {allProjects.map((project, index) => {
                const href = `/portfolio/${project.slug}`;
                const isFeatured = project.featured && project.fromApi;
                return (
                  <article
                    key={project.id ?? `${project.slug}-${index}`}
                    className={cn(
                      "group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm ring-1 ring-black/[0.03] transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5",
                      isFeatured ? "lg:col-span-6" : "lg:col-span-4"
                    )}
                  >
                    <Link href={href} className="relative block aspect-[5/4] overflow-hidden bg-muted">
                      {project.imageUrl ? (
                        <>
                          <Image
                            src={project.imageUrl}
                            alt=""
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                            sizes={
                              isFeatured ? "(max-width:1024px) 100vw, 50vw" : "(max-width:1024px) 100vw, 33vw"
                            }
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-6 text-white">
                            {project.category ? (
                              <Badge variant="secondary" className="w-fit border-0 bg-white/20 text-xs text-white">
                                {project.category}
                              </Badge>
                            ) : null}
                            <h2 className="font-heading text-xl font-bold leading-tight drop-shadow-sm md:text-2xl">
                              {project.title}
                            </h2>
                          </div>
                        </>
                      ) : (
                        <div
                          className={cn(
                            "flex h-full w-full flex-col justify-end p-6 text-white",
                            `bg-gradient-to-br ${project.gradient}`
                          )}
                        >
                          {project.category ? (
                            <Badge variant="secondary" className="mb-2 w-fit border-0 bg-white/20 text-xs text-white">
                              {project.category}
                            </Badge>
                          ) : null}
                          <h2 className="font-heading text-xl font-bold md:text-2xl">{project.title}</h2>
                        </div>
                      )}
                    </Link>

                    <div className="flex flex-1 flex-col p-6">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {t("pages.portfolioPage.client")}: {project.client}
                      </p>
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                        {project.description}
                      </p>
                      {project.tags.length > 0 ? (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {project.tags.slice(0, 5).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-[11px] font-normal">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                      <div className="mt-6">
                        <Link
                          href={href}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground sm:w-auto"
                        >
                          {t("pages.portfolioPage.viewProject")}
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <CTASection />
    </>
  );
}
