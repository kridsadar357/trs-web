"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CTASection } from "@/components/sections/cta-section";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Mail, Linkedin, Twitter } from "lucide-react";

type Member = {
  name: string;
  role: string;
  bio: string;
  specialties: string[];
};

type TeamApiMember = {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  imageUrl: string | null;
  email: string | null;
  linkedin: string | null;
  twitter: string | null;
};

const gradients = [
  "from-primary to-blue-600",
  "from-purple-500 to-pink-500",
  "from-green-500 to-teal-500",
  "from-orange-500 to-red-500",
  "from-indigo-500 to-violet-500",
  "from-pink-500 to-rose-500",
];

export function TeamPageClient() {
  const { t } = useTranslation();
  const raw = t("pages.teamPage.members", { returnObjects: true });
  const fallback = Array.isArray(raw) ? (raw as Member[]) : [];

  const [loading, setLoading] = useState(true);
  const [apiMembers, setApiMembers] = useState<TeamApiMember[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/team", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: unknown) => {
        if (cancelled) return;
        if (Array.isArray(data)) setApiMembers(data as TeamApiMember[]);
      })
      .catch(() => {
        if (!cancelled) setApiMembers([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  type DisplayMember = Member & {
    imageUrl?: string | null;
    email?: string | null;
    linkedin?: string | null;
    twitter?: string | null;
    id?: string;
  };

  const display: DisplayMember[] =
    apiMembers.length > 0
      ? apiMembers.map((m) => ({
          id: m.id,
          name: m.name,
          role: m.role,
          bio: m.bio || "",
          specialties: [],
          imageUrl: m.imageUrl,
          email: m.email,
          linkedin: m.linkedin,
          twitter: m.twitter,
        }))
      : fallback.map((m, i) => ({ ...m, id: `fb-${m.name}-${i}` }));

  return (
    <>
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-4">
              {t("pages.teamPage.badge")}
            </Badge>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold">
              {t("pages.teamPage.titleBefore")}{" "}
              <span className="gradient-text">{t("pages.teamPage.titleHighlight")}</span>{" "}
              {t("pages.teamPage.titleAfter")}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">{t("pages.teamPage.intro")}</p>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading && apiMembers.length === 0 && fallback.length === 0 ? (
              <>
                {[0, 1, 2].map((i) => (
                  <Card key={i} className="overflow-hidden animate-pulse">
                    <div className="h-32 bg-muted" />
                    <CardContent className="pt-12 p-6 space-y-3">
                      <div className="h-4 bg-muted rounded w-1/2" />
                      <div className="h-3 bg-muted rounded w-full" />
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : (
              display.map((member, index) => (
                <Card
                  key={member.id ?? `${member.name}-${index}`}
                  className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div
                    className={`relative h-32 bg-gradient-to-br ${gradients[index % gradients.length]} flex items-end p-6`}
                  >
                    <div className="relative h-16 w-16 rounded-full bg-white shadow-md -mb-8 border-4 border-white overflow-hidden flex items-center justify-center text-xl font-bold text-gray-700 shrink-0">
                      {member.imageUrl ? (
                        <Image src={member.imageUrl} alt="" fill className="object-cover" sizes="64px" />
                      ) : (
                        member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                      )}
                    </div>
                  </div>
                  <CardContent className="pt-12 p-6">
                    <h3 className="font-heading text-lg font-semibold">{member.name}</h3>
                    <p className="text-sm text-primary font-medium">{member.role}</p>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
                    {member.specialties && member.specialties.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {member.specialties.map((s) => (
                          <Badge key={s} variant="outline" className="text-xs">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                    <div className="flex gap-3 mt-4 pt-4 border-t">
                      <a
                        href={member.email ? `mailto:${member.email}` : undefined}
                        className={cn(
                          "text-muted-foreground hover:text-primary transition-colors",
                          !member.email && "pointer-events-none opacity-30"
                        )}
                        aria-disabled={!member.email}
                      >
                        <Mail className="h-4 w-4" />
                      </a>
                      <a
                        href={member.linkedin || undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "text-muted-foreground hover:text-primary transition-colors",
                          !member.linkedin && "pointer-events-none opacity-30"
                        )}
                        aria-disabled={!member.linkedin}
                      >
                        <Linkedin className="h-4 w-4" />
                      </a>
                      <a
                        href={member.twitter || undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "text-muted-foreground hover:text-primary transition-colors",
                          !member.twitter && "pointer-events-none opacity-30"
                        )}
                        aria-disabled={!member.twitter}
                      >
                        <Twitter className="h-4 w-4" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="mb-4">
            {t("pages.teamPage.careersBadge")}
          </Badge>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold">{t("pages.teamPage.careersTitle")}</h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">{t("pages.teamPage.careersBody")}</p>
          <div className="mt-8">
            <Link
              href="/contact"
              className={cn(
                "inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium",
                "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transition-all"
              )}
            >
              {t("pages.teamPage.careersCta")}
            </Link>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
