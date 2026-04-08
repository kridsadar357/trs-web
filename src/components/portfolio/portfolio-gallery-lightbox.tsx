"use client";

import { useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  images: string[];
  openIndex: number | null;
  onClose: () => void;
  onSelectIndex: (i: number) => void;
};

export function PortfolioGalleryLightbox({ images, openIndex, onClose, onSelectIndex }: Props) {
  const open = openIndex !== null && openIndex >= 0 && openIndex < images.length;
  const src = open ? images[openIndex!] : "";
  const canPrev = open && openIndex! > 0;
  const canNext = open && openIndex! < images.length - 1;

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && openIndex > 0) onSelectIndex(openIndex - 1);
      if (e.key === "ArrowRight" && openIndex < images.length - 1) onSelectIndex(openIndex + 1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [openIndex, images.length, onClose, onSelectIndex]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="แกลเลอรี"
      onClick={onClose}
    >
      <button
        type="button"
        className="absolute right-3 top-3 z-10 rounded-full bg-white/15 p-2.5 text-white transition-colors hover:bg-white/25 md:right-6 md:top-6"
        aria-label="ปิด"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </button>

      {canPrev ? (
        <button
          type="button"
          className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/15 p-3 text-white transition-colors hover:bg-white/25 md:left-6"
          aria-label="ก่อนหน้า"
          onClick={(e) => {
            e.stopPropagation();
            onSelectIndex(openIndex! - 1);
          }}
        >
          <ChevronLeft className="h-7 w-7" />
        </button>
      ) : null}

      {canNext ? (
        <button
          type="button"
          className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/15 p-3 text-white transition-colors hover:bg-white/25 md:right-6"
          aria-label="ถัดไป"
          onClick={(e) => {
            e.stopPropagation();
            onSelectIndex(openIndex! + 1);
          }}
        >
          <ChevronRight className="h-7 w-7" />
        </button>
      ) : null}

      <div
        className="flex max-h-[92vh] max-w-[min(100%,1200px)] flex-col items-center px-10 md:px-16"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary upload URLs */}
        <img
          src={src}
          alt=""
          className="max-h-[min(85vh,800px)] w-auto max-w-full rounded-lg object-contain shadow-2xl"
        />
        <p className="mt-3 text-center text-sm text-white/70">
          {openIndex! + 1} / {images.length}
        </p>
      </div>
    </div>
  );
}
