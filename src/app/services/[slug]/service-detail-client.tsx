"use client";

import { useTranslation } from "react-i18next";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { stringArrayFromJson } from "@/lib/cms-display";
import { RteHtmlWithLightbox } from "@/components/content/rte-html-with-lightbox";

export type ServiceDetailPayload = {
  title: string;
  slug: string;
  description: string;
  coverImage: string | null;
  detailContent: string | null;
  features: unknown;
};

export function ServiceDetailClient({ service }: { service: ServiceDetailPayload }) {
  const { t } = useTranslation();
  const features = stringArrayFromJson(service.features);

  return (
    <article>
      <section className="relative border-b bg-muted/20">
        <div className="relative h-[min(52vh,420px)] w-full">
          {service.coverImage ? (
            <Image
              src={service.coverImage}
              alt=""
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary to-blue-700" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-24">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
              >
                <ArrowLeft className="h-4 w-4" /> {t("pages.servicesPage.backToServices")}
              </Link>
              <Badge variant="secondary" className="mb-4">
                {t("pages.servicesPage.badge")}
              </Badge>
              <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold max-w-3xl">{service.title}</h1>
              <p className="mt-4 max-w-2xl text-lg text-muted-foreground leading-relaxed">{service.description}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <div className="lg:col-span-1">
              <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
                {t("pages.servicesPage.included")}
              </h2>
              {features.length > 0 ? (
                <ul className="space-y-3">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">{t("pages.servicesPage.noFeatureList")}</p>
              )}
              <Link
                href="/contact"
                className="mt-8 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg w-full sm:w-auto"
              >
                {t("pages.servicesPage.getQuote")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="lg:col-span-2">
              {service.detailContent ? (
                <RteHtmlWithLightbox
                  html={service.detailContent}
                  className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-heading prose-a:text-primary"
                />
              ) : (
                <p className="text-muted-foreground leading-relaxed">{service.description}</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}
