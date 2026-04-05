"use client";

import { useTranslation } from "react-i18next";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Calendar } from "lucide-react";
import { stringArrayFromJson } from "@/lib/cms-display";
import { RteHtmlWithLightbox } from "@/components/content/rte-html-with-lightbox";

export type PortfolioDetailPayload = {
  title: string;
  slug: string;
  description: string;
  content: string | null;
  client: string | null;
  category: string | null;
  technologies: unknown;
  imageUrl: string | null;
  gallery: unknown;
  completedAt: string | null;
};

export function PortfolioDetailClient({ item }: { item: PortfolioDetailPayload }) {
  const { t } = useTranslation();
  const tags = stringArrayFromJson(item.technologies);
  const gallery = stringArrayFromJson(item.gallery);

  const dateLabel = item.completedAt
    ? new Intl.DateTimeFormat(undefined, { year: "numeric", month: "long", day: "numeric" }).format(
        new Date(item.completedAt)
      )
    : null;

  return (
    <article>
      <section className="relative border-b border-border/60">
        <div className="relative h-[min(56vh,480px)] w-full">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt=""
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-primary to-indigo-800" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
          <div className="absolute inset-0 flex flex-col justify-end">
            <div className="container mx-auto max-w-5xl px-4 pb-12 pt-28 sm:px-6 lg:px-8">
              <Link
                href="/portfolio"
                className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("pages.portfolioPage.backToPortfolio")}
              </Link>
              <div className="flex flex-wrap items-center gap-2">
                {item.category ? (
                  <Badge variant="secondary" className="font-medium">
                    {item.category}
                  </Badge>
                ) : null}
                {dateLabel ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    {dateLabel}
                  </span>
                ) : null}
              </div>
              <h1 className="mt-4 max-w-4xl font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                {item.title}
              </h1>
              {item.client ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  {t("pages.portfolioPage.client")}: <span className="font-medium text-foreground">{item.client}</span>
                </p>
              ) : null}
              <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">{item.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-8 text-base font-medium text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg"
                >
                  {t("pages.portfolioPage.startProject")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {gallery.length > 0 ? (
        <section className="border-b border-border/40 bg-muted/20 py-12">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-6 font-heading text-lg font-semibold">{t("pages.portfolioPage.gallery")}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
              {gallery.map((url) => (
                <div
                  key={url}
                  className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border/60 bg-muted shadow-sm"
                >
                  <Image src={url} alt="" fill className="object-cover" sizes="(max-width:768px) 50vw, 25vw" />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {tags.length > 0 ? (
        <section className="border-b border-border/40 py-8">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("pages.portfolioPage.stack")}
            </h2>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="outline" className="font-normal">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="py-14 lg:py-20">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {item.content?.trim() ? (
            <RteHtmlWithLightbox
              html={item.content}
              className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-heading prose-a:text-primary"
            />
          ) : (
            <p className="leading-relaxed text-muted-foreground">{item.description}</p>
          )}
        </div>
      </section>
    </article>
  );
}
