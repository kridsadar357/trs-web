"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

type LightboxState = { src: string; caption: string } | null;

/**
 * Renders CMS HTML and enables click-to-enlarge on gallery / carousel images from the rich text editor.
 */
export function RteHtmlWithLightbox({ html, className }: { html: string; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lightbox, setLightbox] = useState<LightboxState>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onClick = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof HTMLImageElement)) return;
      if (!target.matches(".rte-gallery__img, .rte-carousel__img")) return;
      e.preventDefault();
      const fig = target.closest("figure");
      const cap = fig?.querySelector("figcaption")?.textContent?.trim() ?? "";
      setLightbox({ src: target.currentSrc || target.src, caption: cap });
    };

    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  }, [html]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox]);

  return (
    <>
      <div ref={containerRef} className={className} dangerouslySetInnerHTML={{ __html: html }} />
      {lightbox ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/88 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className="absolute right-3 top-3 z-10 rounded-full bg-white/15 p-2.5 text-white transition-colors hover:bg-white/25 md:right-6 md:top-6"
            aria-label="Close"
            onClick={() => setLightbox(null)}
          >
            <X className="h-6 w-6" />
          </button>
          <div className="flex max-h-[92vh] max-w-[min(100%,1200px)] flex-col items-center" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element -- lightbox needs arbitrary CMS URLs */}
            <img
              src={lightbox.src}
              alt=""
              className="max-h-[min(85vh,800px)] w-auto max-w-full rounded-lg object-contain shadow-2xl"
            />
            {lightbox.caption ? (
              <p className="mt-4 max-w-2xl text-center text-sm leading-relaxed text-white/90">{lightbox.caption}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
