import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SupportPwaExperience } from "@/components/chat-app/support-pwa-experience";

export const metadata: Metadata = {
  title: "TRS Support Chat",
  description: "แชทซัพพอร์ต — แอปและการแจ้งเตือน",
  applicationName: "TRS Support Chat",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TRS Chat",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [{ url: "/chat-app/icon", sizes: "512x512", type: "image/png" }],
    apple: [{ url: "/chat-app/apple-icon", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#065f46",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function ChatAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      <div className="relative min-h-[100dvh] overflow-x-hidden bg-zinc-950 text-zinc-100 antialiased">
        <div
          className="pointer-events-none fixed inset-0 -z-10"
          aria-hidden
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(16,185,129,0.18),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_100%_50%,rgba(59,130,246,0.08),transparent_50%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(9,9,11,0.3),rgb(9,9,11))]" />
        </div>
        <div className="relative z-0 min-h-[100dvh]">
          <SupportPwaExperience>{children}</SupportPwaExperience>
        </div>
      </div>
    </ThemeProvider>
  );
}
