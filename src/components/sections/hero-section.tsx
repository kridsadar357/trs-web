"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { RteHtmlWithLightbox } from "@/components/content/rte-html-with-lightbox";

type Stat = { value: string; label: string };
type SettingsMap = Record<string, string>;

function parseStats(raw: string | undefined): Stat[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (x): x is Stat =>
          x && typeof x === "object" && typeof (x as Stat).value === "string" && typeof (x as Stat).label === "string"
      )
      .slice(0, 6);
  } catch {
    return [];
  }
}

function pickSetting(settings: SettingsMap, key: string, fallback: string) {
  const raw = settings[key];
  if (raw == null) return fallback;
  const trimmed = String(raw).trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

export function HeroSection() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<SettingsMap>({});

  useEffect(() => {
    let cancelled = false;
    fetch("/api/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: unknown) => {
        if (!cancelled && data && typeof data === "object") {
          setSettings(data as SettingsMap);
        }
      })
      .catch(() => {
        if (!cancelled) setSettings({});
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const parsedStats = useMemo(() => parseStats(settings.homeHeroStats), [settings.homeHeroStats]);

  const stats = useMemo(() => {
    if (parsedStats.length > 0) return parsedStats;
    return [
      { value: t("site.heroDefaults.stat1Value"), label: t("site.heroDefaults.stat1Label") },
      { value: t("site.heroDefaults.stat2Value"), label: t("site.heroDefaults.stat2Label") },
      { value: t("site.heroDefaults.stat3Value"), label: t("site.heroDefaults.stat3Label") },
    ];
  }, [parsedStats, t]);

  const badge = pickSetting(settings, "homeHeroBadge", t("site.heroDefaults.badge"));
  const heroImage = pickSetting(settings, "homeHeroImage", "/hero/pos-modern-hero.png");
  const titleBefore = pickSetting(settings, "homeHeroTitleBefore", t("site.heroDefaults.titleBefore"));
  const titleHighlight = pickSetting(settings, "homeHeroTitleHighlight", t("site.heroDefaults.titleHighlight"));
  const titleAfter = pickSetting(settings, "homeHeroTitleAfter", t("site.heroDefaults.titleAfter"));
  const subtitle = pickSetting(settings, "homeHeroSubtitle", t("site.heroDefaults.subtitle"));
  const ctaPrimary = pickSetting(settings, "homeHeroPrimaryCtaText", t("site.heroDefaults.ctaPrimary"));
  const ctaSecondary = pickSetting(settings, "homeHeroSecondaryCtaText", t("site.heroDefaults.ctaSecondary"));

  const imageAlt = useMemo(() => {
    const base = subtitle.length > 0 ? subtitle : t("site.heroDefaults.imageAlt");
    return base.length > 125 ? `${base.slice(0, 122)}…` : base;
  }, [subtitle, t]);

  const useCustomHtml = ["1", "true", "yes", "on"].includes(
    String(settings.homeHeroUseCustomHtml || "").trim().toLowerCase(),
  );
  const customHeroHtml = String(settings.homeHeroCustomHtml || "").trim();

  if (useCustomHtml && customHeroHtml.length > 0) {
    return (
      <section className="relative overflow-hidden border-b border-border/60 bg-background text-foreground">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-muted/50 via-background to-background" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.2]"
          style={{
            backgroundImage: `
            linear-gradient(to right, hsl(var(--border) / 0.7) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border) / 0.7) 1px, transparent 1px)
          `,
            backgroundSize: "48px 48px",
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-secondary/[0.05]" />
        <div className="relative z-[1] mx-auto max-w-7xl px-4 pb-14 pt-6 sm:px-6 sm:pb-16 sm:pt-8 lg:px-8 lg:pb-20 lg:pt-10">
          <RteHtmlWithLightbox
            html={customHeroHtml}
            className="cms-hero-custom prose prose-lg max-w-none dark:prose-invert prose-headings:font-heading prose-a:text-primary"
          />
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden border-b border-border/60 bg-background text-foreground">
      {/* Light surface + faint grid (theme-aware) */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-muted/50 via-background to-background" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.2]"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--border) / 0.7) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border) / 0.7) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-secondary/[0.05]" />

      <div className="relative z-[1] mx-auto max-w-7xl px-4 pb-14 pt-6 sm:px-6 sm:pb-16 sm:pt-8 lg:px-8 lg:pb-20 lg:pt-10">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          {/* Left: headline, description, CTAs, stats */}
          <div className="space-y-6 text-center lg:text-left">
            <p className="inline-flex items-center rounded-md border border-border bg-muted/60 px-3 py-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {badge}
            </p>

            <h1 className="font-heading text-3xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-4xl lg:text-[2.65rem] lg:leading-[1.08] xl:text-5xl">
              <span className="mr-1">{titleBefore}</span>
              <span className="gradient-text">{titleHighlight}</span>
              <span className="ml-1">{titleAfter}</span>
            </h1>

            <p className="mx-auto max-w-xl text-base leading-relaxed text-muted-foreground lg:mx-0 lg:text-lg">
              {subtitle}
            </p>

            <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center lg:justify-start">
              <Link href="/contact" className="sm:w-auto">
                <Button size="lg" className="h-12 w-full gap-2 px-7 text-base sm:w-auto">
                  {ctaPrimary}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/portfolio" className="sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 w-full border-border bg-background/80 px-7 text-base sm:w-auto"
                >
                  {ctaSecondary}
                </Button>
              </Link>
            </div>

            {stats.length > 0 && (
              <div className="border-t border-border/80 pt-8">
                <div className="flex flex-wrap items-center justify-center gap-y-4 lg:justify-start">
                  {stats.map((stat, i) => (
                    <div key={`${stat.value}-${stat.label}`} className="flex items-center">
                      {i > 0 ? (
                        <span className="mx-4 hidden h-8 w-px bg-border sm:inline" aria-hidden />
                      ) : null}
                      <div className="min-w-[5.5rem] text-center sm:text-left">
                        <div className="font-heading text-xl font-semibold tabular-nums text-foreground sm:text-2xl">
                          {stat.value}
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: product visual */}
          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-border/80 bg-muted shadow-lg shadow-black/[0.06] ring-1 ring-black/[0.04] dark:shadow-black/30 dark:ring-white/[0.06]">
              <Image
                src={heroImage}
                alt={imageAlt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                unoptimized={heroImage.endsWith(".svg")}
                className="object-cover object-center"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
