"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CTASection } from "@/components/sections/cta-section";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { stringArrayFromJson } from "@/lib/cms-display";
import { generateSlug } from "@/lib/slugify";

type ServiceRow = {
  title: string;
  description: string;
  features: string[];
  slug: string;
  coverImage: string | null;
  fromApi: boolean;
};

type ServiceApiItem = {
  id: string;
  title: string;
  slug: string;
  description: string;
  features: unknown;
  coverImage: string | null;
};

export function ServicesPageClient() {
  const { t } = useTranslation();
  const items = t("pages.servicesPage.items", { returnObjects: true }) as {
    title: string;
    description: string;
    features: string[];
  }[];
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

  const list: ServiceRow[] =
    apiItems.length > 0
      ? apiItems.map((s) => ({
          title: s.title,
          description: s.description,
          features: stringArrayFromJson(s.features),
          slug: s.slug,
          coverImage: s.coverImage,
          fromApi: true,
        }))
      : fallback.map((s) => ({
          title: s.title,
          description: s.description,
          features: Array.isArray(s.features) ? s.features : [],
          slug: generateSlug(s.title),
          coverImage: null,
          fromApi: false,
        }));

  return (
    <>
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-4">
              {t("pages.servicesPage.badge")}
            </Badge>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold">
              {t("pages.servicesPage.titleBefore")}{" "}
              <span className="gradient-text">{t("pages.servicesPage.titleHighlight")}</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">{t("pages.servicesPage.intro")}</p>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {loading && apiItems.length === 0 && fallback.length === 0 ? (
            <>
              {[0, 1].map((i) => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <CardContent className="p-0">
                    <div className="h-64 bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            list.map((service, i) => (
              <Card key={service.fromApi ? apiItems[i]?.id ?? service.slug : `${service.slug}-${i}`} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 lg:grid-cols-5">
                    <div className="relative lg:col-span-2 min-h-[220px] lg:min-h-[280px]">
                      {service.coverImage ? (
                        <>
                          <Image
                            src={service.coverImage}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 40vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/20" />
                          <div className="absolute inset-0 p-8 lg:p-10 flex flex-col justify-end text-white">
                            <h2 className="font-heading text-2xl lg:text-3xl font-bold mb-3 drop-shadow-sm">
                              {service.title}
                            </h2>
                            <p className="text-white/90 text-sm lg:text-base line-clamp-4">{service.description}</p>
                          </div>
                        </>
                      ) : (
                        <div
                          className={`h-full min-h-[220px] lg:min-h-[280px] bg-gradient-to-br p-8 lg:p-10 flex flex-col justify-center text-white ${
                            i % 3 === 0
                              ? "from-blue-500 to-blue-600"
                              : i % 3 === 1
                                ? "from-purple-500 to-purple-600"
                                : "from-green-500 to-green-600"
                          }`}
                        >
                          <h2 className="font-heading text-2xl lg:text-3xl font-bold mb-3">{service.title}</h2>
                          <p className="text-white/80 text-sm lg:text-base">{service.description}</p>
                        </div>
                      )}
                    </div>
                    <div className="lg:col-span-3 p-8 lg:p-10">
                      <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">
                        {t("pages.servicesPage.included")}
                      </h3>
                      {service.features?.length ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {service.features.map((feature) => (
                            <div key={feature} className="flex items-center gap-2">
                              <Check className={`h-4 w-4 shrink-0 ${i % 2 === 0 ? "text-primary" : "text-secondary"}`} />
                              <span className="text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">{t("pages.servicesPage.noFeatureList")}</p>
                      )}
                      <div className="mt-6 flex flex-wrap gap-3">
                        {service.fromApi ? (
                          <Link
                            href={`/services/${service.slug}`}
                            className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-md transition-all hover:bg-primary/90"
                          >
                            {t("pages.servicesPage.seeMore")}
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        ) : null}
                        <Link
                          href="/contact"
                          className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-input bg-background px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                        >
                          {t("pages.servicesPage.getQuote")}
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>

      <CTASection />
    </>
  );
}
