import type { Metadata } from "next";
import { TeamPageClient } from "./team-page-client";

export const metadata: Metadata = {
  title: "Team",
  description: "Meet the designers, developers, and strategists behind TRS.",
  openGraph: {
    title: "Team | TRS",
    description: "The people building your next digital experience.",
  },
};

export default function TeamPage() {
  return <TeamPageClient />;
}
