"use client";

import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";

export default function PrivacyPage() {
  const { t } = useTranslation();
  return (
    <article className="py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <Badge variant="secondary" className="mb-4">
          {t("site.footer.privacy")}
        </Badge>
        <h1 className="font-heading text-4xl font-bold mb-2">{t("pages.legal.privacyTitle")}</h1>
        <p className="text-sm text-muted-foreground mb-10">{t("pages.legal.privacyUpdated")}</p>
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-muted-foreground">
          <p>{t("pages.legal.privacyP1")}</p>
          <p>{t("pages.legal.privacyP2")}</p>
          <p>{t("pages.legal.privacyP3")}</p>
          <p>{t("pages.legal.privacyP4")}</p>
          <p>
            {t("pages.legal.contactEmailLabel")}{" "}
            <a href="mailto:hello@trs.com" className="text-primary hover:underline">
              hello@trs.com
            </a>
          </p>
        </div>
      </div>
    </article>
  );
}
