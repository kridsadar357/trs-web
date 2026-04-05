import type { Metadata } from "next";
import { BlogPageClient } from "./blog-page-client";

export const metadata: Metadata = {
  title: "Blog",
  description: "Insights on web development, design, engineering, and digital strategy from the TRS team.",
  openGraph: {
    title: "Blog | TRS",
    description: "Articles and insights from our team.",
  },
};

export default function BlogPage() {
  return <BlogPageClient />;
}
