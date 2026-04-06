import type { MetadataRoute } from "next";

/**
 * Relative start_url / scope so installs resolve correctly:
 * - Main site: manifest at /chat-app/manifest.webmanifest → start_url /chat-app/
 * - chats.*: rewritten /manifest.webmanifest → start_url /
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "TRS Support Chat",
    short_name: "TRS Chat",
    description: "แชทซัพพอร์ตลูกค้าแบบเรียลไทม์ — ติดตั้งแอปและรับการแจ้งเตือน",
    start_url: ".",
    scope: ".",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    background_color: "#09090b",
    theme_color: "#065f46",
    orientation: "portrait-primary",
    categories: ["business", "productivity"],
    icons: [
      {
        src: "/chat-app/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "กล่องข้อความ",
        short_name: "Inbox",
        description: "เปิดคิวแชทลูกค้า",
        url: "./inbox",
        icons: [{ src: "/chat-app/icon", sizes: "512x512", type: "image/png" }],
      },
    ],
  };
}
