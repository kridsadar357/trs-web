"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { gradientAt, stringArrayFromJson } from "@/lib/cms-display";
import { cn } from "@/lib/utils";
import { generateSlug } from "@/lib/slugify";

type PortfolioItem = {
  title: string;
  category: string;
  description: string;
  tags: string[];
  gradient: string;
  imageUrl?: string | null;
  slug: string;
};

type PortfolioApiItem = {
  id: string;
  title: string;
  description: string;
  category: string | null;
  technologies: unknown;
  imageUrl: string | null;
  slug: string;
};

export function PortfolioSection() {
  const { t } = useTranslation();
  const raw = t("pages.home.portfolio.items", { returnObjects: true });
  const fallback = Array.isArray(raw) ? (raw as PortfolioItem[]) : [];

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

  const projects: PortfolioItem[] =
    apiItems.length > 0
      ? apiItems.slice(0, 6).map((item, i) => ({
          title: item.title,
          category: item.category || "",
          description: item.description,
          tags: stringArrayFromJson(item.technologies),
          gradient: gradientAt(i),
          imageUrl: item.imageUrl,
          slug: item.slug,
        }))
      : fallback.map((p) => ({
          ...p,
          slug: (p as PortfolioItem & { slug?: string }).slug || generateSlug(p.title),
        }));

  return (
    <section className="relative overflow-hidden py-24">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.2]"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--border) / 0.55) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border) / 0.55) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />
      <div className="relative container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">
            {t("pages.home.portfolio.badge")}
          </Badge>
          <h2 className="font-heading text-3xl font-bold sm:text-4xl">
            {t("pages.home.portfolio.titleBefore")}{" "}
            <span className="gradient-text">{t("pages.home.portfolio.titleHighlight")}</span>
          </h2>
          <p className="mt-4 text-muted-foreground">{t("pages.home.portfolio.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {loading && apiItems.length === 0 && fallback.length === 0 ? (
            <>
              {[0, 1, 2].map((i) => (
                <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-border/60 bg-card">
                  <div className="aspect-[5/4] bg-muted" />
                  <div className="space-y-3 p-5">
                    <div className="h-4 w-2/3 rounded bg-muted" />
                    <div className="h-3 w-full rounded bg-muted" />
                  </div>
                </div>
              ))}
            </>
          ) : (
            projects.map((project, index) => {
              const key =
                apiItems.length > 0 && apiItems[index] ? apiItems[index]!.id : `${project.title}-${index}`;
              const href = `/portfolio/${project.slug}`;
              return (
                <article
                  key={key}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm ring-1 ring-black/[0.03] transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-lg"
                >
                  <Link href={href} className="relative block aspect-[5/4] overflow-hidden bg-muted">
                    {project.imageUrl ? (
                      <>
                        <Image
                          src={project.imageUrl}
                          alt=""
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-5">
                          {project.category ? (
                            <Badge variant="secondary" className="mb-2 border-0 bg-white/20 text-xs text-white">
                              {project.category}
                            </Badge>
                          ) : null}
                          <h3 className="font-heading text-lg font-bold text-white drop-shadow-md md:text-xl">
                            {project.title}
                          </h3>
                        </div>
                      </>
                    ) : (
                      <div
                        className={cn(
                          "flex h-full w-full flex-col justify-end p-5 text-white",
                          `bg-gradient-to-br ${project.gradient}`
                        )}
                      >
                        {project.category ? (
                          <Badge variant="secondary" className="mb-2 w-fit border-0 bg-white/20 text-xs text-white">
                            {project.category}
                          </Badge>
                        ) : null}
                        <h3 className="font-heading text-lg font-bold md:text-xl">{project.title}</h3>
                      </div>
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                      {project.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {project.tags?.slice(0, 4).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[10px] font-normal">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Link
                      href={href}
                      className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-primary/25 bg-primary/5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground sm:w-auto sm:px-4"
                    >
                      {t("pages.portfolioPage.viewProject")}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              );
            })
          )}
        </div>

        <div className="mt-12 text-center">
          <Link href="/portfolio">
            <Button variant="outline" className="gap-2">
              {t("pages.home.portfolio.viewAll")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
