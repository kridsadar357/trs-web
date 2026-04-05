"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, Send, Clock, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      company: formData.get("company"),
      subject: formData.get("subject"),
      message: formData.get("message"),
    };

    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    }
  };

  const hoursLines = t("pages.contact.hoursValue").split("\n");
  const contactEmail = settings.contactEmail || "hello@trs.com";
  const contactPhone = settings.contactPhone || "+1 (555) 123-4567";
  const contactAddress = settings.address || "123 Innovation Drive\nTech City, TC 12345";
  const addressLines = contactAddress.split("\n").filter(Boolean);

  return (
    <>
      <section className="py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-4">
              {t("pages.contact.badge")}
            </Badge>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold">
              {t("pages.contact.title")}{" "}
              <span className="gradient-text">{t("pages.contact.titleHighlight")}</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">{t("pages.contact.intro")}</p>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {submitted ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h2 className="font-heading text-2xl font-bold mb-2">{t("pages.contact.successTitle")}</h2>
                    <p className="text-muted-foreground mb-6">{t("pages.contact.successBody")}</p>
                    <Button onClick={() => setSubmitted(false)} variant="outline">
                      {t("pages.contact.sendAnother")}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-6 sm:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">
                            {t("pages.contact.name")} *
                          </Label>
                          <Input id="name" name="name" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">
                            {t("pages.contact.email")} *
                          </Label>
                          <Input id="email" name="email" type="email" required />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">{t("pages.contact.phone")}</Label>
                          <Input id="phone" name="phone" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company">{t("pages.contact.company")}</Label>
                          <Input id="company" name="company" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">
                          {t("pages.contact.subject")} *
                        </Label>
                        <Input id="subject" name="subject" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">
                          {t("pages.contact.message")} *
                        </Label>
                        <Textarea id="message" name="message" rows={6} required />
                      </div>
                      <Button type="submit" size="lg" className="gap-2 w-full sm:w-auto">
                        <Send className="h-4 w-4" />
                        {t("pages.contact.send")}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{t("pages.contact.emailLabel")}</h3>
                      <p className="text-sm text-muted-foreground">{contactEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{t("pages.contact.phoneLabel")}</h3>
                      <p className="text-sm text-muted-foreground">{contactPhone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{t("pages.contact.officeLabel")}</h3>
                      <p className="text-sm text-muted-foreground">
                        {addressLines.map((line, i) => (
                          <span key={i}>
                            {line}
                            {i < addressLines.length - 1 && <br />}
                          </span>
                        ))}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{t("pages.contact.hoursLabel")}</h3>
                      <p className="text-sm text-muted-foreground">
                        {hoursLines.map((line, i) => (
                          <span key={i}>
                            {line}
                            {i < hoursLines.length - 1 && <br />}
                          </span>
                        ))}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-primary to-secondary text-white">
                <CardContent className="p-6 text-center">
                  <h3 className="font-heading font-bold text-lg mb-2">{t("pages.contact.quickTitle")}</h3>
                  <p className="text-white/80 text-sm">{t("pages.contact.quickBody")}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
