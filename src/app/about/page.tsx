import type { Metadata } from "next";
import { AboutPageClient } from "./about-page-client";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about TRS — our values, mission, and journey building digital experiences since 2016.",
  openGraph: {
    title: "About TRS",
    description: "Our values, mission, and journey as a digital agency.",
  },
};

export default function AboutPage() {
  return <AboutPageClient />;
}
