"use client";

import { ChevronLeft, ChevronRight, RotateCcw, RotateCw } from "lucide-react";
import type { PublicGalleryItem } from "@/lib/landing";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const overlayButton =
  "inline-flex items-center justify-center w-11 h-11 rounded-pill bg-surface-secondary/15 backdrop-blur-sm border border-surface-secondary/25 text-content-contrast transition-all hover:bg-surface-secondary/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";
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
  t: (key: string, values?: Record<string, string | number>) => string;
}) {
  const activeTitle = active?.alt ?? active?.caption ?? "";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {active && (
        <DialogContent
          closeLabel={t("gallery.close")}
          overlayClassName="bg-content-primary/95"
          className="max-w-[min(95vw,64rem)] bg-transparent border-0 shadow-none p-0 rounded-none gap-0 flex flex-col items-center"
        >
          <DialogTitle className="sr-only">{activeTitle}</DialogTitle>
          <div className="relative animate-fade-in">
            <img
              src={active.imageUrl}
              alt={active.alt}
              width={900}
              height={1200}
              sizes="(max-width: 1024px) 95vw, 900px"
              className="w-auto max-w-full max-h-[70dvh] object-contain rounded-card transition-transform duration-300"
              style={{ transform: `rotate(${rotation}deg)` }}
            />
          </div>
          <p className="text-content-contrast text-center mt-4 text-body-sm font-medium">{activeTitle}</p>
          <div className="flex justify-center gap-3 mt-6">
            <button type="button" onClick={() => onNavigate("prev")} className={overlayButton} aria-label={t("gallery.previous")}>
              <ChevronLeft className="w-5 h-5 rtl-mirror" strokeWidth={2} aria-hidden="true" />
            </button>
            <button type="button" onClick={onRotateLeft} className={overlayButton} aria-label={t("gallery.rotateLeft")}>
              <RotateCcw className="w-5 h-5" strokeWidth={2} aria-hidden="true" />
            </button>
            <button type="button" onClick={onRotateRight} className={overlayButton} aria-label={t("gallery.rotateRight")}>
              <RotateCw className="w-5 h-5" strokeWidth={2} aria-hidden="true" />
            </button>
            <button type="button" onClick={() => onNavigate("next")} className={overlayButton} aria-label={t("gallery.next")}>
              <ChevronRight className="w-5 h-5 rtl-mirror" strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
          <div className="flex justify-center gap-2 mt-4">
            {items.map((item, index) => (
              <button key={item.key} type="button" onClick={() => onSelect(index)} aria-label={t("gallery.goToImage", { number: index + 1 })} aria-current={index === items.indexOf(active) ? "true" : undefined} className="w-11 h-11 inline-flex items-center justify-center rounded-pill focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold">
                <span className={`block w-2 h-2 rounded-pill transition-all ${index === items.indexOf(active) ? "bg-content-contrast scale-125" : "bg-content-contrast/40"}`} />
              </button>
            ))}
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
