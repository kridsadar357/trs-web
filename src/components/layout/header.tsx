"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { ChevronDown, Menu, X } from "lucide-react";

type SiteNavKey = "home" | "about" | "services" | "portfolio" | "team" | "blog" | "contact";

const companySubKeys: { href: string; key: SiteNavKey }[] = [
  { href: "/about", key: "about" },
  { href: "/team", key: "team" },
  { href: "/blog", key: "blog" },
];

function NavDropdown({
  label,
  items,
  pathname,
  t,
}: {
  label: string;
  items: { href: string; key: SiteNavKey }[];
  pathname: string;
  t: (k: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);
  const active = items.some((i) => pathname === i.href || pathname.startsWith(i.href + "/"));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className={cn(
          "flex items-center gap-0.5 rounded-full px-2.5 py-1.5 text-[13px] font-medium transition-colors sm:px-3 sm:text-sm",
          active ? navActive : navMuted
        )}
      >
        {label}
        <ChevronDown className={cn("h-3.5 w-3.5 opacity-80 transition-transform", open && "rotate-180")} />
      </button>
      {open ? (
        <div
          className={cn(
            "absolute left-0 top-[calc(100%+10px)] z-[200] min-w-[200px] overflow-hidden rounded-2xl py-1",
            glassPanel
          )}
          role="menu"
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              className={cn(
                "block px-4 py-2.5 text-sm font-medium transition-colors rounded-lg mx-1",
                pathname === item.href ? navActive : navMuted
              )}
              onClick={() => setOpen(false)}
            >
              {t(`site.nav.${item.key}`)}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** Matches page content width: same as hero `max-w-7xl` + horizontal padding */
const headerContainerClass = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";

/** iOS-style glass: readable on light pages + dark hero (no overflow-hidden — it clips dropdowns) */
const glassBar =
  "relative border border-zinc-900/12 bg-white/75 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.14),inset_0_1px_0_0_rgba(255,255,255,0.9)] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/25 dark:bg-white/[0.08] dark:shadow-[0_12px_48px_-12px_rgba(0,0,0,0.45),inset_0_1px_0_0_rgba(255,255,255,0.22)] dark:supports-[backdrop-filter]:bg-white/[0.06]";

const glassSheen =
  "pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/90 via-transparent to-zinc-100/30 opacity-90 dark:from-white/[0.14] dark:via-transparent dark:to-white/[0.03] dark:opacity-70";

const glassPanel =
  "border border-zinc-200/90 bg-white/90 text-zinc-900 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.12),inset_0_1px_0_0_rgba(255,255,255,0.95)] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/20 dark:bg-zinc-950/85 dark:text-zinc-100 dark:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.12)]";

const navMuted =
  "text-zinc-800 hover:bg-zinc-950/[0.08] hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white";

const navActive =
  "bg-zinc-900/[0.11] text-zinc-950 dark:bg-white/10 dark:text-white";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <header className="fixed left-0 right-0 top-0 z-[100] pt-4 md:pt-5">
      <div className={headerContainerClass}>
        <div
          className={cn(
            "relative flex w-full items-center justify-between gap-2 rounded-full px-3 py-2.5 sm:gap-3 sm:px-5 md:px-6",
            glassBar
          )}
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full" aria-hidden>
            <span className={glassSheen} />
          </div>
          <Link
            href="/"
            className="group relative z-[1] flex shrink-0 items-center justify-center -my-0.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent dark:focus-visible:ring-white/40"
            aria-label="TRS NextGen — หน้าแรก"
          >
            <Image
              src="/logo.png"
              alt="TRS NextGen"
              width={320}
              height={72}
              className="h-10 w-auto max-w-[min(78vw,16rem)] shrink-0 object-contain object-left sm:h-11 sm:max-w-[18rem] md:max-w-[20rem]"
              priority
            />
          </Link>

          <nav className="relative z-[1] hidden items-center gap-0.5 lg:flex lg:gap-1" aria-label="Main">
            <Link
              href="/"
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === "/" ? navActive : navMuted
              )}
            >
              {t("site.nav.home")}
            </Link>
            <Link
              href="/services"
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === "/services" || pathname.startsWith("/services/") ? navActive : navMuted
              )}
            >
              {t("site.nav.services")}
            </Link>
            <Link
              href="/portfolio"
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === "/portfolio" || pathname.startsWith("/portfolio/") ? navActive : navMuted
              )}
            >
              {t("site.nav.portfolio")}
            </Link>
            <NavDropdown label={t("site.nav.company")} items={companySubKeys} pathname={pathname} t={t} />
            <Link
              href="/contact"
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === "/contact" ? navActive : navMuted
              )}
            >
              {t("site.nav.contact")}
            </Link>
          </nav>

          <div className="relative z-[1] flex items-center gap-1 sm:gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link href="/contact" className="hidden sm:block">
              <Button
                size="sm"
                className="h-9 rounded-lg border-0 bg-zinc-800 px-4 text-white hover:bg-zinc-700"
              >
                {t("site.cta.getStarted")}
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-800 hover:bg-zinc-950/10 dark:text-white dark:hover:bg-white/10 lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? t("common.close") : "Menu"}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileOpen ? (
          <div className={cn("relative mt-3 overflow-hidden rounded-2xl p-3 lg:hidden", glassPanel)}>
            <span className={glassSheen} aria-hidden />
            <div className="relative z-[1] space-y-1">
            {(
              [
                { href: "/", key: "home" as const },
                { href: "/services", key: "services" as const },
                { href: "/portfolio", key: "portfolio" as const },
                { href: "/contact", key: "contact" as const },
              ] as const
            ).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname === link.href ? navActive : navMuted
                )}
              >
                {t(`site.nav.${link.key}`)}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => setCompanyOpen(!companyOpen)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium",
                navMuted
              )}
            >
              {t("site.nav.company")}
              <ChevronDown className={cn("h-4 w-4 transition-transform", companyOpen && "rotate-180")} />
            </button>
            {companyOpen ? (
              <div className="ml-2 border-l border-zinc-200 pl-3 dark:border-white/15">
                {companySubKeys.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-md py-2 text-sm text-zinc-700 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
                  >
                    {t(`site.nav.${item.key}`)}
                  </Link>
                ))}
              </div>
            ) : null}
            <Link href="/contact" onClick={() => setMobileOpen(false)} className="block pt-1">
              <Button className="h-11 w-full rounded-lg border-0 bg-zinc-800/90 text-white shadow-inner backdrop-blur-sm hover:bg-zinc-700/90">
                {t("site.cta.getStarted")}
              </Button>
            </Link>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
