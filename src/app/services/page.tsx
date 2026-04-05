import type { Metadata } from "next";
import { ServicesPageClient } from "./services-page-client";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Web development, UI/UX design, mobile apps, cloud solutions, digital marketing, and technology consulting.",
  openGraph: {
    title: "Services | TRS",
    description: "Full-service digital solutions for your business.",
  },
};

export default function ServicesPage() {
  return <ServicesPageClient />;
}
