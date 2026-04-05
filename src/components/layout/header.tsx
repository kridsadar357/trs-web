"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { ChevronDown, Hexagon, Menu, X } from "lucide-react";

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
          active ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white"
        )}
      >
        {label}
        <ChevronDown className={cn("h-3.5 w-3.5 opacity-80 transition-transform", open && "rotate-180")} />
      </button>
      {open ? (
        <div
          className="absolute left-0 top-[calc(100%+10px)] z-[120] min-w-[200px] rounded-xl border border-white/10 bg-zinc-950/95 py-1 shadow-2xl shadow-black/40 backdrop-blur-xl"
          role="menu"
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              className={cn(
                "block px-4 py-2.5 text-sm transition-colors",
                pathname === item.href
                  ? "bg-white/10 text-white"
                  : "text-zinc-300 hover:bg-white/5 hover:text-white"
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

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <header className="fixed left-0 right-0 top-0 z-50 pt-4 md:pt-5">
      <div className={headerContainerClass}>
        <div className="flex w-full items-center justify-between gap-2 rounded-full border border-white/10 bg-zinc-950/80 px-3 py-2 shadow-lg shadow-black/25 backdrop-blur-xl sm:gap-3 sm:px-5 md:px-6">
          <Link href="/" className="group flex shrink-0 items-center gap-2.5">
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
              <Hexagon className="absolute h-7 w-7 text-white/90" strokeWidth={1.35} />
              <span className="relative h-2 w-2 rounded-full bg-white" />
            </div>
            <span className="font-heading text-lg font-semibold tracking-tight text-white">TRS</span>
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex lg:gap-1" aria-label="Main">
            <Link
              href="/"
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === "/" ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white"
              )}
            >
              {t("site.nav.home")}
            </Link>
            <Link
              href="/services"
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === "/services" || pathname.startsWith("/services/")
                  ? "bg-white/10 text-white"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              )}
            >
              {t("site.nav.services")}
            </Link>
            <Link
              href="/portfolio"
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === "/portfolio" || pathname.startsWith("/portfolio/")
                  ? "bg-white/10 text-white"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              )}
            >
              {t("site.nav.portfolio")}
            </Link>
            <NavDropdown label={t("site.nav.company")} items={companySubKeys} pathname={pathname} t={t} />
            <Link
              href="/contact"
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === "/contact"
                  ? "bg-white/10 text-white"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              )}
            >
              {t("site.nav.contact")}
            </Link>
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <div className="[&_button]:border-0 [&_button]:text-white/90 [&_button:hover]:bg-white/10">
              <LanguageSwitcher darkSurface />
            </div>
            <div className="[&_button]:text-white/90 [&_button:hover]:bg-white/10">
              <ThemeToggle />
            </div>
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
              className="text-white hover:bg-white/10 lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? t("common.close") : "Menu"}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileOpen ? (
          <div className="mt-3 space-y-1 rounded-2xl border border-white/10 bg-zinc-950/95 p-3 shadow-xl backdrop-blur-xl lg:hidden">
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
                  pathname === link.href
                    ? "bg-white/10 text-white"
                    : "text-zinc-300 hover:bg-white/5 hover:text-white"
                )}
              >
                {t(`site.nav.${link.key}`)}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => setCompanyOpen(!companyOpen)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium text-zinc-300 hover:bg-white/5 hover:text-white"
            >
              {t("site.nav.company")}
              <ChevronDown className={cn("h-4 w-4 transition-transform", companyOpen && "rotate-180")} />
            </button>
            {companyOpen ? (
              <div className="ml-2 border-l border-white/10 pl-3">
                {companySubKeys.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-md py-2 text-sm text-zinc-400 hover:text-white"
                  >
                    {t(`site.nav.${item.key}`)}
                  </Link>
                ))}
              </div>
            ) : null}
            <Link href="/contact" onClick={() => setMobileOpen(false)} className="block pt-1">
              <Button className="h-11 w-full rounded-lg border-0 bg-zinc-800 text-white hover:bg-zinc-700">
                {t("site.cta.getStarted")}
              </Button>
            </Link>
          </div>
        ) : null}
      </div>
    </header>
  );
}
