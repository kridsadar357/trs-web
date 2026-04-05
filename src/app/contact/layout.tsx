import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact TRS for web projects, consulting, and partnerships. We respond within one business day.",
  openGraph: {
    title: "Contact | TRS",
    description: "Get in touch with our team.",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
