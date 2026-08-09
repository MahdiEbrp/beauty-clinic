"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getGalleryItems } from "@/data/gallery";
import GalleryLightbox from "@/components/gallery/GalleryLightbox";

export default function Gallery() {
  const t = useTranslations();
  const items = getGalleryItems();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);

  const isOpen = lightboxIndex !== null;

  const scroll = useCallback((towards: "start" | "end") => {
    const el = scrollRef.current;
    if (!el) return;
    const first = el.children[0];
    const step =
      first instanceof HTMLElement ? first.offsetWidth + 16 : 300;
    // `scrollBy` is direction-aware in every modern engine: positive `left`
    // always advances towards the inline end, including under RTL where
    // scrollLeft runs negative. No manual mirroring is needed.
    el.scrollBy({ left: towards === "end" ? step : -step, behavior: "smooth" });
  }, []);

  const navigate = useCallback(
    (dir: "prev" | "next") => {
      setRotation(0);
      setLightboxIndex((current) => {
        if (current === null) return current;
        const delta = dir === "next" ? 1 : -1;
        return (current + delta + items.length) % items.length;
      });
    },
    [items.length],
  );

  const rotateLeft = useCallback(() => setRotation((r) => r - 90), []);
  const rotateRight = useCallback(() => setRotation((r) => r + 90), []);

  // Radix Dialog owns Escape, the focus trap and the scroll lock. Only the
  // gallery-specific keys are handled here.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      // Arrow keys follow what the user sees, so they invert under RTL.
      const rtl = document.documentElement.dir === "rtl";
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        navigate(rtl ? "next" : "prev");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        navigate(rtl ? "prev" : "next");
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        rotateRight();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, navigate, rotateRight]);

  // eslint-disable-next-line security/detect-object-injection -- array indexing by a clamped numeric index
  const active = lightboxIndex === null ? null : items[lightboxIndex];

  return (
    <section id="gallery" className="py-24 relative bg-surface-primary">
      <div className="relative max-w-content mx-auto px-6">
        <div className="mb-16 text-center mx-auto max-w-prose">
          <h2 className="text-heading-1 text-accent">
            {t("gallery.heading")}
          </h2>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => scroll("start")}
            className="absolute top-1/2 -translate-y-1/2 -inset-s-3 z-10 w-11 h-11 rounded-pill bg-surface-secondary/90 backdrop-blur-sm border border-border-interactive shadow-elevation-2 flex items-center justify-center text-accent transition-all duration-200 hover:bg-surface-secondary hover:shadow-elevation-3 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            aria-label={t("gallery.previous")}
          >
            <ChevronLeft
              className="w-5 h-5 rtl-mirror"
              strokeWidth={2}
              aria-hidden="true"
            />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory px-1 py-2"
          >
            {items.map((item, index) => {
              const title = t(item.tKey);
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setRotation(0);
                    setLightboxIndex(index);
                  }}
                  aria-label={t("gallery.viewImage", { title })}
                  className="relative rounded-panel overflow-hidden aspect-3/4 group border-4 border-surface-secondary shadow-elevation-1 snap-start shrink-0 w-[clamp(260px,80vw,320px)] p-0 bg-transparent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <Image
                    src={item.image}
                    alt={title}
                    fill
                    sizes="(max-width: 640px) 80vw, 320px"
                    className="object-cover transition-transform duration-600 group-hover:scale-105"
                  />
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => scroll("end")}
            className="absolute top-1/2 -translate-y-1/2 -inset-e-3 z-10 w-11 h-11 rounded-pill bg-surface-secondary/90 backdrop-blur-sm border border-border-interactive shadow-elevation-2 flex items-center justify-center text-accent transition-all duration-200 hover:bg-surface-secondary hover:shadow-elevation-3 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            aria-label={t("gallery.next")}
          >
            <ChevronRight
              className="w-5 h-5 rtl-mirror"
              strokeWidth={2}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      <GalleryLightbox
        open={isOpen}
        active={active}
        items={items}
        rotation={rotation}
        onOpenChange={(open) => { if (!open) { setLightboxIndex(null); setRotation(0); } }}
        onNavigate={navigate}
        onRotateLeft={rotateLeft}
        onRotateRight={rotateRight}
        onSelect={(index) => { setRotation(0); setLightboxIndex(index); }}
        t={t}
      />
    </section>
  );
}
