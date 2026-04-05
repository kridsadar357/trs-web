"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-medium text-primary mb-2">404</p>
      <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-3">{t("pages.notFound.title")}</h1>
      <p className="text-muted-foreground max-w-md mb-8">{t("pages.notFound.description")}</p>
      <Link
        href="/"
        className={cn(
          "inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium",
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transition-all"
        )}
      >
        {t("pages.notFound.cta")}
      </Link>
    </div>
  );
}
