"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Item = { name: string; role: string; company: string; content: string; rating: number };

type TestimonialApiItem = {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  content: string;
  rating: number;
  imageUrl?: string | null;
  featured?: boolean;
};

type DisplayTestimonial = {
  id: string | null;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  imageUrl: string | null;
  featured: boolean;
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function chunk<T>(arr: T[], size: number): T[][] {
  if (size < 1) return [arr];
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

function TestimonialCard({ testimonial, t }: { testimonial: DisplayTestimonial; t: (k: string) => string }) {
  return (
    <article
      className={cn(
        "group relative flex h-full min-h-[280px] flex-col overflow-hidden rounded-xl border border-border/70 bg-card/95 shadow-sm ring-1 ring-black/[0.02] transition-all duration-300",
        "hover:border-primary/20 hover:shadow-md"
      )}
    >
      {testimonial.featured ? (
        <span className="absolute right-3 top-3 z-10 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
          {t("pages.home.testimonials.featured")}
        </span>
      ) : null}

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <Quote className="mb-3 h-7 w-7 text-primary/15" strokeWidth={1.25} />

        <div className="mb-3 flex gap-0.5" aria-label={`${testimonial.rating} out of 5 stars`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-3.5 w-3.5",
                i < testimonial.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/25"
              )}
            />
          ))}
        </div>

        <blockquote className="mb-4 min-h-0 flex-1 border-none text-sm font-normal leading-relaxed text-foreground/90">
          <span className="text-muted-foreground/70">&ldquo;</span>
          <span className="line-clamp-6">{testimonial.content}</span>
          <span className="text-muted-foreground/70">&rdquo;</span>
        </blockquote>

        <footer className="mt-auto flex items-center gap-3 border-t border-border/60 pt-4">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-primary/15 to-primary/5 ring-2 ring-background">
            {testimonial.imageUrl ? (
              <Image
                src={testimonial.imageUrl}
                alt={testimonial.name}
                fill
                className="object-cover"
                sizes="44px"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center font-heading text-xs font-semibold text-primary">
                {initials(testimonial.name)}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-heading text-sm font-semibold text-foreground">{testimonial.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {[testimonial.role, testimonial.company].filter(Boolean).join(" · ")}
            </p>
          </div>
        </footer>
      </div>
    </article>
  );
}

export function TestimonialsSection() {
  const { t } = useTranslation();
  const items = t("pages.home.testimonials.items", { returnObjects: true }) as Item[];
  const fallbackRaw = Array.isArray(items) ? items : [];
  const fallback: DisplayTestimonial[] = fallbackRaw.map((x, i) => ({
    id: `fallback-${i}`,
    name: x.name,
    role: x.role || "",
    company: x.company || "",
    content: x.content,
    rating: Math.min(5, Math.max(1, x.rating ?? 5)),
    imageUrl: null,
    featured: false,
  }));

  const [loading, setLoading] = useState(true);
  const [apiItems, setApiItems] = useState<TestimonialApiItem[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [perPage, setPerPage] = useState(3);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/testimonials", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: unknown) => {
        if (cancelled) return;
        if (Array.isArray(data)) setApiItems(data as TestimonialApiItem[]);
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

  useEffect(() => {
    const narrow = window.matchMedia("(max-width: 1023px)");
    const apply = () => setPerPage(narrow.matches ? 1 : 3);
    apply();
    narrow.addEventListener("change", apply);
    return () => narrow.removeEventListener("change", apply);
  }, []);

  const list: DisplayTestimonial[] =
    apiItems.length > 0
      ? apiItems.map((x) => ({
          id: x.id,
          name: x.name,
          role: x.role || "",
          company: x.company || "",
          content: x.content,
          rating: Math.min(5, Math.max(1, x.rating || 5)),
          imageUrl: x.imageUrl?.trim() || null,
          featured: Boolean(x.featured),
        }))
      : fallback;

  const pages = useMemo(() => chunk(list, perPage), [list, perPage]);

  useEffect(() => {
    setPageIndex((i) => Math.min(i, Math.max(0, pages.length - 1)));
  }, [pages.length]);

  const goPrev = useCallback(() => {
    setPageIndex((i) => Math.max(0, i - 1));
  }, []);

  const goNext = useCallback(() => {
    setPageIndex((i) => Math.min(pages.length - 1, i + 1));
  }, [pages.length]);

  const canPrev = pageIndex > 0;
  const canNext = pageIndex < pages.length - 1;
  const showArrows = pages.length > 1;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-muted/40 via-background to-background py-24">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--border) / 0.5) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border) / 0.5) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">
            {t("pages.home.testimonials.badge")}
          </Badge>
          <h2 className="font-heading text-3xl font-bold sm:text-4xl">
            {t("pages.home.testimonials.titleBefore")}{" "}
            <span className="gradient-text">{t("pages.home.testimonials.titleHighlight")}</span>
          </h2>
          <p className="mt-4 text-muted-foreground">{t("pages.home.testimonials.subtitle")}</p>
        </div>

        {loading && list.length === 0 ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl border border-border/60 bg-card/60 p-6"
              >
                <div className="mb-4 h-6 w-6 rounded bg-muted" />
                <div className="mb-3 flex gap-1">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="h-3.5 w-3.5 rounded bg-muted" />
                  ))}
                </div>
                <div className="mb-4 space-y-2">
                  <div className="h-3 w-full rounded bg-muted" />
                  <div className="h-3 w-full rounded bg-muted" />
                  <div className="h-3 w-4/5 rounded bg-muted" />
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <div className="h-11 w-11 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/3 rounded bg-muted" />
                    <div className="h-2 w-1/2 rounded bg-muted" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : list.length === 0 ? null : (
          <div className="relative">
            {showArrows ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="absolute left-0 top-1/2 z-20 h-10 w-10 -translate-x-2 -translate-y-1/2 rounded-full border-border/80 bg-background/95 shadow-md backdrop-blur-sm lg:-translate-x-4"
                  disabled={!canPrev}
                  onClick={goPrev}
                  aria-label={t("pages.home.testimonials.prev")}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="absolute right-0 top-1/2 z-20 h-10 w-10 -translate-y-1/2 translate-x-2 rounded-full border-border/80 bg-background/95 shadow-md backdrop-blur-sm lg:translate-x-4"
                  disabled={!canNext}
                  onClick={goNext}
                  aria-label={t("pages.home.testimonials.next")}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            ) : null}

            <div className="overflow-hidden px-2 sm:px-4 lg:px-10">
              <div
                className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
                style={{ transform: `translateX(-${pageIndex * 100}%)` }}
              >
                {pages.map((page, pi) => (
                  <div
                    key={pi}
                    className="w-full shrink-0 px-1 sm:px-2"
                    aria-hidden={pi !== pageIndex}
                  >
                    <div
                      className={cn(
                        "grid gap-6",
                        perPage === 1 ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3"
                      )}
                    >
                      {page.map((testimonial) => (
                        <TestimonialCard
                          key={testimonial.id ?? testimonial.name + pi}
                          testimonial={testimonial}
                          t={t}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {showArrows ? (
              <div className="mt-8 flex justify-center gap-1.5">
                {pages.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={cn(
                      "h-2 rounded-full transition-all",
                      i === pageIndex ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    )}
                    aria-label={t("pages.home.testimonials.goToSlide", { index: i + 1 })}
                    aria-current={i === pageIndex}
                    onClick={() => setPageIndex(i)}
                  />
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
