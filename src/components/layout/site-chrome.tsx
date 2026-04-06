"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LiveChatWidget } from "@/components/chat/live-chat-widget";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isChatApp = pathname.startsWith("/chat-app");

  if (isAdmin || isChatApp) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      {/* Offset for fixed dark navbar (pt-4/5 + bar height) */}
      <main className="flex-1 pt-24 md:pt-28">{children}</main>
      <Footer />
      <LiveChatWidget />
    </div>
  );
}
