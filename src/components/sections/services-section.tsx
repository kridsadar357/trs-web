"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ServiceItem = { title: string; description: string };

type ServiceApiItem = {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage: string | null;
};

type DisplayService = {
  key: string;
  title: string;
  description: string;
  coverImage: string | null;
  href: string;
};

export function ServicesSection() {
  const { t } = useTranslation();
  const items = t("pages.home.services.items", { returnObjects: true }) as ServiceItem[];
  const fallback = Array.isArray(items) ? items : [];

  const [loading, setLoading] = useState(true);
  const [apiItems, setApiItems] = useState<ServiceApiItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/services", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: unknown) => {
        if (cancelled) return;
        if (Array.isArray(data)) setApiItems(data as ServiceApiItem[]);
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

  const display: DisplayService[] =
    apiItems.length > 0
      ? apiItems.map((s) => ({
          key: s.id,
          title: s.title,
          description: s.description,
          coverImage: s.coverImage?.trim() || null,
          href: `/services/${s.slug}`,
        }))
      : fallback.map((s, i) => ({
          key: `fb-${i}`,
          title: s.title,
          description: s.description,
          coverImage: null,
          href: "/services",
        }));

  const cardClass =
    "group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card text-left shadow-sm ring-1 ring-black/[0.03] transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-xl hover:shadow-primary/5";

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background via-muted/25 to-background py-24">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.3]"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--border) / 0.6) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border) / 0.6) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">
            {t("pages.home.services.badge")}
          </Badge>
          <h2 className="font-heading text-3xl font-bold sm:text-4xl">
            {t("pages.home.services.titleBefore")}{" "}
            <span className="gradient-text">{t("pages.home.services.titleHighlight")}</span>
          </h2>
          <p className="mt-4 text-muted-foreground">{t("pages.home.services.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {loading && apiItems.length === 0 && fallback.length === 0 ? (
            <>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="animate-pulse overflow-hidden rounded-2xl border border-border/60 bg-card"
                >
                  <div className="aspect-[16/10] bg-muted" />
                  <div className="space-y-3 p-6">
                    <div className="h-5 w-2/3 rounded bg-muted" />
                    <div className="h-3 w-full rounded bg-muted" />
                    <div className="h-3 w-5/6 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </>
          ) : (
            display.map((service, index) => (
              <Link key={service.key} href={service.href} className={cardClass}>
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  {service.coverImage ? (
                    <>
                      <Image
                        src={service.coverImage}
                        alt=""
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-5 pt-16">
                        <h3 className="font-heading text-lg font-semibold leading-snug text-white drop-shadow-md md:text-xl">
                          {service.title}
                        </h3>
                      </div>
                    </>
                  ) : (
                    <div
                      className={cn(
                        "flex h-full w-full flex-col justify-end p-5 text-white",
                        index % 3 === 0 && "bg-gradient-to-br from-primary to-primary/75",
                        index % 3 === 1 && "bg-gradient-to-br from-violet-600 to-indigo-700",
                        index % 3 === 2 && "bg-gradient-to-br from-emerald-600 to-teal-700"
                      )}
                    >
                      <h3 className="font-heading text-lg font-semibold leading-snug md:text-xl">
                        {service.title}
                      </h3>
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col border-t border-border/60 p-5">
                  <p className="text-sm leading-relaxed text-muted-foreground line-clamp-4">
                    {service.description}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
                    <span>{t("pages.home.services.learnMore")}</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        <div className="mt-14 text-center">
          <Link href="/services">
            <Button variant="outline" className="gap-2">
              {t("pages.home.services.viewAll")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
