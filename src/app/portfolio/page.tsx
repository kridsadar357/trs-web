import type { Metadata } from "next";
import { PortfolioPageClient } from "./portfolio-page-client";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Selected client projects — web applications, e-commerce, mobile apps, and cloud platforms.",
  openGraph: {
    title: "Portfolio | TRS",
    description: "Explore our work across industries and technologies.",
  },
};

export default function PortfolioPage() {
  return <PortfolioPageClient />;
}
