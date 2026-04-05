"use client";

import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";

function syncHtmlLang() {
  const raw = i18n.resolvedLanguage || i18n.language || "th";
  document.documentElement.lang = raw.split("-")[0];
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    syncHtmlLang();
    i18n.on("languageChanged", syncHtmlLang);
    return () => {
      i18n.off("languageChanged", syncHtmlLang);
    };
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
