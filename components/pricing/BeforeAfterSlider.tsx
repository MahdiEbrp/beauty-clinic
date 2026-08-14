"use client";

import { useCallback, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronsLeftRight } from "lucide-react";
import ServiceImage from "./ServiceImage";

type BeforeAfterSliderProps = {
  before: string;
  after: string;
  title: string;
};

/**
 * Draggable before/after comparison. The "before" image sits on the start side
 * (right in RTL) and is revealed as the handle moves. Keyboard-operable via
 * the slider role (arrow keys, shift for bigger steps).
 */
export default function BeforeAfterSlider({
  before,
  after,
  title,
}: BeforeAfterSliderProps) {
  const locale = useLocale();
  const t = useTranslations();
  const rtl = locale === "fa";

  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [pos, setPos] = useState(50);

  const update = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const raw = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, raw)));
  }, []);

  const onPointerDown = (event: React.PointerEvent) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragging.current = true;
    update(event.clientX);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (dragging.current) update(event.clientX);
  };

  const stop = () => {
    dragging.current = false;
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    const step = event.shiftKey ? 10 : 5;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setPos((value) => Math.max(0, value - step));
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      setPos((value) => Math.min(100, value + step));
    }
  };

  const beforeClip = rtl ? `inset(0 ${100 - pos}% 0 0)` : `inset(0 0 0 ${100 - pos}%)`;

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      className="relative aspect-[4/3] w-full touch-none select-none overflow-hidden rounded-control"
    >
      <ServiceImage
        src={after}
        alt={`${title} — ${t("serviceDetail.labels.after")}`}
        fill
        sizes="(max-width: 768px) 100vw, 640px"
        className="object-cover"
      />

      <div className="absolute inset-0" style={{ clipPath: beforeClip }}>
        <ServiceImage
          src={before}
          alt={`${title} — ${t("serviceDetail.labels.before")}`}
          fill
          sizes="(max-width: 768px) 100vw, 640px"
          className="object-cover"
        />
      </div>

      <span className="absolute start-3 top-3 z-10 rounded-pill bg-surface-secondary/90 px-3 py-1 text-caption font-bold text-content-primary shadow-elevation-1">
        {t("serviceDetail.labels.before")}
      </span>
      <span className="absolute end-3 top-3 z-10 rounded-pill bg-surface-secondary/90 px-3 py-1 text-caption font-bold text-content-primary shadow-elevation-1">
        {t("serviceDetail.labels.after")}
      </span>

      <div
        role="slider"
        tabIndex={0}
        aria-label={t("pricing.detail.beforeAfter")}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        onKeyDown={onKeyDown}
        className="group absolute inset-y-0 z-10 flex w-11 cursor-ew-resize items-center justify-center outline-none"
        style={{ insetInlineStart: `${pos}%`, transform: "translateX(-50%)" }}
      >
        <div className="h-full w-0.5 bg-surface-secondary/90" aria-hidden="true" />
        <div className="absolute flex size-11 items-center justify-center rounded-pill border border-border-interactive bg-surface-secondary text-accent shadow-elevation-3 transition-colors group-hover:border-accent group-focus-visible:outline-2 group-focus-visible:outline-offset-4 group-focus-visible:outline-accent">
          <ChevronsLeftRight className="size-5 rtl-mirror" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}