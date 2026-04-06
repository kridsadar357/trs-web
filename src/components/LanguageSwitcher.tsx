"use client";

import { useTranslation } from "react-i18next";
import { useState, useRef, useEffect } from "react";
import { Languages, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const languages = [
  { code: "th" as const, label: "TH", fullLabel: "ภาษาไทย" },
  { code: "en" as const, label: "EN", fullLabel: "English" },
];

function resolvedCode(i18n: { language: string; resolvedLanguage?: string }) {
  const raw = i18n.resolvedLanguage || i18n.language || "th";
  const base = raw.split("-")[0];
  return base === "en" ? "en" : "th";
}

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = resolvedCode(i18n);

  const currentLang = languages.find((l) => l.code === active) ?? languages[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function switchLanguage(code: string) {
    void i18n.changeLanguage(code);
    if (typeof document !== "undefined") {
      document.documentElement.lang = code;
    }
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn(
          "h-9 gap-1.5 px-2.5 font-medium",
          "border-zinc-900/25 bg-zinc-950/[0.04] text-zinc-900 shadow-sm",
          "hover:bg-zinc-950/[0.10] hover:text-zinc-950",
          "dark:border-white/25 dark:bg-white/10 dark:text-white dark:shadow-none",
          "dark:hover:bg-white/15 dark:hover:text-white",
          open ? "ring-2 ring-zinc-900/20 dark:ring-white/35" : ""
        )}
        onClick={() => setOpen(!open)}
        aria-label={t("common.language")}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Languages className="h-4 w-4 shrink-0 text-zinc-700 dark:text-white/85" />
        <span className="tabular-nums font-semibold">{currentLang.label}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-transform text-zinc-600 dark:text-white/80",
            open && "rotate-180"
          )}
        />
      </Button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-[calc(100%+6px)] z-[200] min-w-[160px] overflow-hidden rounded-xl border border-zinc-200/90 bg-white/95 p-1 text-zinc-900 shadow-lg backdrop-blur-xl dark:border-white/15 dark:bg-zinc-950/95 dark:text-zinc-100 dark:shadow-2xl"
        >
          {languages.map((lang) => {
            const selected = active === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => switchLanguage(lang.code)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors",
                  selected
                    ? "bg-primary/12 text-primary dark:bg-white/10 dark:text-white"
                    : "hover:bg-zinc-100 dark:hover:bg-white/10"
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    selected
                      ? "border-2 border-primary bg-primary/10 dark:border-white/40 dark:bg-white/10"
                      : "border border-zinc-200 bg-zinc-50 dark:border-white/20 dark:bg-white/5"
                  )}
                >
                  {lang.label}
                </span>
                <span className="flex-1 font-medium">{lang.fullLabel}</span>
                {selected && <Check className="h-4 w-4 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
