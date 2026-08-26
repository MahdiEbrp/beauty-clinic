"use client";

import { ChevronLeft, ChevronRight, RotateCcw, RotateCw } from "lucide-react";
import type { PublicGalleryItem } from "@/lib/landing";
import type { DynamicTranslate } from "@/src/i18n/message-key";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const overlayButton =
  "inline-flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-pill bg-surface-secondary/15 backdrop-blur-sm border border-surface-secondary/25 text-content-contrast transition-all hover:bg-surface-secondary/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold shrink-0";

const DOT_DISPLAY_THRESHOLD = 6;

type GalleryItem = PublicGalleryItem;

export default function GalleryLightbox({
  open,
  active,
  items,
  rotation,
  onOpenChange,
  onNavigate,
  onRotateLeft,
  onRotateRight,
  onSelect,
  t,
}: {
  open: boolean;
  active: GalleryItem | null;
  items: GalleryItem[];
  rotation: number;
  onOpenChange: (open: boolean) => void;
  onNavigate: (direction: "prev" | "next") => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onSelect: (index: number) => void;
  t: DynamicTranslate;
}) {
  const activeTitle = active?.alt ?? active?.caption ?? "";
  const activeIndex = active ? items.indexOf(active) : -1;
  const showDots = items.length > 1 && items.length <= DOT_DISPLAY_THRESHOLD;
  const showCounter = items.length > DOT_DISPLAY_THRESHOLD;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {active && (
        <DialogContent
          closeLabel={t("close")}
          overlayClassName="bg-content-primary/95"
          className="max-w-[min(95vw,64rem)] max-h-dvh overflow-hidden bg-transparent border-0 shadow-none p-4 sm:p-6 rounded-none gap-0 flex flex-col items-center"
        >
          <DialogTitle className="sr-only">{activeTitle}</DialogTitle>

          <div className="relative w-full flex-1 min-h-0 flex items-center justify-center animate-fade-in">
            <img
              src={active.imageUrl}
              alt={active.alt}
              width={900}
              height={1200}
              sizes="(max-width: 1024px) 95vw, 900px"
              className="w-auto max-w-full max-h-[60dvh] sm:max-h-[65dvh] object-contain rounded-card transition-transform duration-300"
              style={{ transform: `rotate(${rotation}deg)` }}
            />
          </div>

          <p className="text-content-contrast text-center mt-3 sm:mt-4 text-body-sm font-medium shrink-0 px-2">
            {activeTitle}
          </p>

          <div className="flex justify-center items-center gap-2 sm:gap-3 mt-4 sm:mt-6 shrink-0">
            <button type="button" onClick={() => onNavigate("prev")} className={overlayButton} aria-label={t("previous")}>
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 rtl-mirror" strokeWidth={2} aria-hidden="true" />
            </button>
            <button type="button" onClick={onRotateLeft} className={overlayButton} aria-label={t("rotateLeft")}>
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} aria-hidden="true" />
            </button>
            <button type="button" onClick={onRotateRight} className={overlayButton} aria-label={t("rotateRight")}>
              <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} aria-hidden="true" />
            </button>
            <button type="button" onClick={() => onNavigate("next")} className={overlayButton} aria-label={t("next")}>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 rtl-mirror" strokeWidth={2} aria-hidden="true" />
            </button>
          </div>

          {showDots && (
            <div className="flex justify-center items-center gap-2 mt-3 sm:mt-4 shrink-0">
              {items.map((item, index) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onSelect(index)}
                  aria-label={t("goToImage", { number: index + 1 })}
                  aria-current={index === activeIndex ? "true" : undefined}
                  className="w-8 h-8 sm:w-9 sm:h-9 inline-flex items-center justify-center rounded-pill focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                >
                  <span
                    className={`block rounded-pill transition-all duration-300 ${index === activeIndex
                        ? "w-6 h-1.5 bg-content-contrast"
                        : "w-1.5 h-1.5 bg-content-contrast/35 hover:bg-content-contrast/60"
                      }`}
                  />
                </button>
              ))}
            </div>
          )}

          {showCounter && (
            <p
              className="text-content-contrast/70 text-body-sm font-medium mt-3 sm:mt-4 shrink-0 tabular-nums"
              aria-live="polite"
            >
              {activeIndex + 1} / {items.length}
            </p>
          )}
        </DialogContent>
      )}
    </Dialog>
  );
}