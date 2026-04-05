import type { Metadata } from "next";
import { HeroSection } from "@/components/sections/hero-section";
import { ServicesSection } from "@/components/sections/services-section";
import { PortfolioSection } from "@/components/sections/portfolio-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { CTASection } from "@/components/sections/cta-section";

export const metadata: Metadata = {
  title: "Home",
  description:
    "TRS — digital agency for custom web development, UI/UX design, mobile apps, and cloud solutions.",
  openGraph: {
    title: "TRS — Digital Agency",
    description: "We build digital experiences that matter.",
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <PortfolioSection />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}
