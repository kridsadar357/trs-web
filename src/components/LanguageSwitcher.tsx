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

type LanguageSwitcherProps = {
  /** Light controls on dark / glass nav (e.g. home hero) */
  darkSurface?: boolean;
};

export default function LanguageSwitcher({ darkSurface = false }: LanguageSwitcherProps) {
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
          darkSurface
            ? "border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            : "border-border bg-background/80 hover:bg-accent/50",
          !darkSurface && open && "ring-2 ring-primary/30",
          darkSurface && open && "ring-2 ring-white/25"
        )}
        onClick={() => setOpen(!open)}
        aria-label={t("common.language")}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Languages className={cn("h-4 w-4 shrink-0", darkSurface ? "text-white/70" : "text-muted-foreground")} />
        <span className="tabular-nums">{currentLang.label}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 transition-transform",
            darkSurface ? "text-white/70" : "text-muted-foreground",
            open && "rotate-180"
          )}
        />
      </Button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-[calc(100%+6px)] z-[100] min-w-[160px] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
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
                  "flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-sm transition-colors",
                  selected ? "bg-primary/10 text-primary" : "hover:bg-accent"
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    selected ? "border-2 border-primary bg-primary/10" : "border border-border bg-muted/50"
                  )}
                >
                  {lang.label}
                </span>
                <span className="flex-1">{lang.fullLabel}</span>
                {selected && <Check className="h-4 w-4 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
