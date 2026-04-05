"use client";

import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CTASection } from "@/components/sections/cta-section";
import { Target, Heart, Zap, Users } from "lucide-react";

type Value = { title: string; description: string };
type Milestone = { year: string; event: string };

const valueIcons = [Target, Heart, Zap, Users];

export function AboutPageClient() {
  const { t } = useTranslation();
  const values = t("pages.about.values", { returnObjects: true }) as Value[];
  const milestones = t("pages.about.milestones", { returnObjects: true }) as Milestone[];
  const valueList = Array.isArray(values) ? values : [];
  const milestoneList = Array.isArray(milestones) ? milestones : [];

  return (
    <>
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-4">
              {t("pages.about.badge")}
            </Badge>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold">
              {t("pages.about.titleBefore")}{" "}
              <span className="gradient-text">{t("pages.about.titleHighlight")}</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">{t("pages.about.intro")}</p>
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold">
              {t("pages.about.valuesTitleBefore")}{" "}
              <span className="gradient-text">{t("pages.about.valuesTitleHighlight")}</span>
            </h2>
            <p className="mt-4 text-muted-foreground">{t("pages.about.valuesSubtitle")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {valueList.map((value, i) => {
              const Icon = valueIcons[i] ?? Target;
              return (
                <Card key={value.title} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-semibold mb-2">{value.title}</h3>
                      <p className="text-sm text-muted-foreground">{value.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold">
              {t("pages.about.journeyTitleBefore")}{" "}
              <span className="gradient-text">{t("pages.about.journeyTitleHighlight")}</span>
            </h2>
          </div>

          <div className="max-w-2xl mx-auto space-y-8">
            {milestoneList.map((milestone, i) => (
              <div key={milestone.year} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                    {milestone.year}
                  </div>
                  {i < milestoneList.length - 1 && <div className="w-px flex-1 min-h-[2rem] bg-border mt-2" />}
                </div>
                <div className="pb-8">
                  <p className="text-muted-foreground">{milestone.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
