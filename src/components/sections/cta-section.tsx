"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTASection() {
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

  const title = settings.homeCtaTitle ?? "";
  const subtitle = settings.homeCtaSubtitle ?? "";
  const primary = settings.homeCtaPrimaryText ?? "";
  const secondary = settings.homeCtaSecondaryText ?? "";

  if (!title && !subtitle && !primary && !secondary) {
    return null;
  }

  return (
    <section className="py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-90" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />

          <div className="relative px-8 py-16 sm:px-16 sm:py-20 text-center">
            {title ? <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white max-w-2xl mx-auto">{title}</h2> : null}
            {subtitle ? <p className="mt-4 text-lg text-white/80 max-w-xl mx-auto">{subtitle}</p> : null}
            {primary || secondary ? (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                {primary ? (
                  <Link href="/contact">
                    <Button size="lg" className="bg-white text-primary hover:bg-white/90 gap-2 shadow-lg">
                      {primary}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : null}
                {secondary ? (
                  <Link href="/portfolio">
                    <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                      {secondary}
                    </Button>
                  </Link>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
