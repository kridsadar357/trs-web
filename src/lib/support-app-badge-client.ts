"use client";

type NavWithBadge = Navigator & {
  setAppBadge?: (n: number) => Promise<void>;
  clearAppBadge?: () => Promise<void>;
};

/** Badging API — installed PWA / supported Chromium browsers. */
export function syncSupportAppBadge(count: number): void {
  if (typeof navigator === "undefined") return;
  const nav = navigator as NavWithBadge;
  if (count > 0) {
    if (nav.setAppBadge) void nav.setAppBadge(count).catch(() => {});
    return;
  }
  if (nav.clearAppBadge) void nav.clearAppBadge().catch(() => {});
}
