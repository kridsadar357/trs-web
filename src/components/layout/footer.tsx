"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Code, Mail, Phone, MapPin, Github, Linkedin, Twitter } from "lucide-react";

const quickLinkKeys = ["about", "services", "portfolio", "blog"] as const;

const serviceKeys = ["serviceWebDev", "serviceUiUx", "serviceMobile", "serviceCloud"] as const;

export function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    fetch("/api/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: unknown) => {
        if (!cancelled && data && typeof data === "object") {
          setSettings(data as Record<string, string>);
        }
      })
      .catch(() => {
        if (!cancelled) setSettings({});
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const contactEmail = settings.contactEmail || "hello@trs.com";
  const contactPhone = settings.contactPhone || "+1 (555) 123-4567";
  const contactAddress = settings.address || "123 Innovation Drive, Tech City, TC 12345";
  const phoneHref = contactPhone.replace(/[^\d+]/g, "") || "#";

  return (
    <footer className="mt-auto border-t border-border/80 bg-muted/40">
      <div className="container mx-auto px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4 lg:gap-10">
          <div className="space-y-3 sm:space-y-4">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">
                <Code className="h-5 w-5" />
              </div>
              <span className="font-heading text-xl font-bold">TRS</span>
            </Link>
            <p className="max-w-md text-pretty text-sm leading-relaxed text-muted-foreground sm:max-w-xs">
              {t("site.footer.tagline")}
            </p>
            <div className="flex gap-3 pt-1">
              <a href="#" className="text-muted-foreground transition-colors hover:text-primary" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground transition-colors hover:text-primary" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground transition-colors hover:text-primary" aria-label="GitHub">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:contents">
            <nav className="min-w-0" aria-label={t("site.footer.quickLinks")}>
              <h3 className="mb-3 font-heading text-sm font-semibold sm:mb-4 sm:text-base">
                {t("site.footer.quickLinks")}
              </h3>
              <ul className="space-y-1.5 text-sm sm:space-y-2">
                {quickLinkKeys.map((key) => (
                  <li key={key}>
                    <Link
                      href={`/${key}`}
                      className="text-muted-foreground transition-colors hover:text-primary"
                    >
                      {t(`site.nav.${key}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav className="min-w-0" aria-label={t("site.footer.servicesTitle")}>
              <h3 className="mb-3 font-heading text-sm font-semibold sm:mb-4 sm:text-base">
                {t("site.footer.servicesTitle")}
              </h3>
              <ul className="space-y-1.5 text-sm sm:space-y-2">
                {serviceKeys.map((key) => (
                  <li key={key}>
                    <Link href="/services" className="text-muted-foreground transition-colors hover:text-primary">
                      {t(`site.footer.${key}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="min-w-0 border-t border-border/60 pt-6 lg:border-t-0 lg:pt-0">
            <h3 className="mb-3 font-heading text-sm font-semibold sm:mb-4 sm:text-base">
              {t("site.footer.contactTitle")}
            </h3>
            <ul className="space-y-2.5 text-sm sm:space-y-3">
              <li className="flex gap-2.5 text-muted-foreground">
                <Mail className="mt-0.5 h-4 w-4 shrink-0" />
                <a href={`mailto:${contactEmail}`} className="min-w-0 break-all hover:text-primary">
                  {contactEmail}
                </a>
              </li>
              <li className="flex gap-2.5 text-muted-foreground">
                <Phone className="mt-0.5 h-4 w-4 shrink-0" />
                <a href={`tel:${phoneHref}`} className="hover:text-primary">
                  {contactPhone}
                </a>
              </li>
              <li className="flex gap-2.5 text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="text-pretty leading-snug">{contactAddress}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-stretch gap-4 border-t border-border/60 pt-6 sm:mt-10 sm:flex-row sm:items-center sm:justify-between sm:pt-8 lg:mt-12">
          <p className="text-center text-sm text-muted-foreground sm:text-left">
            {t("site.footer.copyright", { year })}
          </p>
          <div className="flex justify-center gap-6 text-sm text-muted-foreground sm:justify-end">
            <Link href="/privacy" className="transition-colors hover:text-primary">
              {t("site.footer.privacy")}
            </Link>
            <Link href="/terms" className="transition-colors hover:text-primary">
              {t("site.footer.terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
