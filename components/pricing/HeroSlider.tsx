"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PublicTreeGroup } from "@/lib/services/types";
import GroupGlyph from "@/components/create-group/GroupGlyph";
import { pricingImage } from "@/data/pricing-media";
import { cn } from "@/lib/utils";

type HeroSliderProps = {
  groups: PublicTreeGroup[];
  onExplore: (groupSlug: string) => void;
};

const AUTOPLAY_MS = 6000;

/** Full-bleed auto-playing hero slider — one slide per service group. */
export default function HeroSlider({ groups, onExplore }: HeroSliderProps) {
  const t = useTranslations();
  const [index, setIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const count = groups.length;
  const goTo = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count],
  );

  const stop = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (typeof window !== "undefined") {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduceMotion) return;
    }
    stop();
    timer.current = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
  }, [count, stop]);

  useEffect(() => {
    start();
    return stop;
  }, [start, stop]);

  if (count === 0) {
    return (
      <section className="relative aspect-4/5 w-full overflow-hidden bg-primary-deep sm:aspect-video lg:aspect-21/9" />
    );
  }

  // eslint-disable-next-line security/detect-object-injection -- array index into a bounded group list, safe
  const current = groups[index];

  return (
    <section
      aria-label={t("pricing.hero.title")}
      className="relative w-full overflow-hidden bg-primary-deep"
    >
      {/*
        Aspect-ratio driven height instead of raw vh:
        - Taller/portrait-ish on phones so the stacked content (badge, heading,
          description, CTA) has room without the box being viewport-tall.
        - Widens out to video/cinema ratios as screens grow.
        - min/max clamp keeps it sane on very short or very tall viewports.
      */}
      <div className="relative aspect-4/5 min-h-105 max-h-180 w-full sm:aspect-video md:max-h-160 lg:aspect-21/9">
        {groups.map((group, i) => (
          <div
            key={group.slug}
            role="group"
            aria-roledescription="slide"
            aria-labelledby={`hero-slide-label-${group.slug}`}
            aria-hidden={i !== index}
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              i === index ? "z-10 opacity-100" : "z-0 opacity-0",
            )}
          >
            <img
              src={pricingImage(group.image)}
              alt=""
              sizes="100vw"
              fetchPriority={i === 0 ? "high" : undefined}
              className="absolute inset-0 h-full w-full object-cover"
            />
            {/* Consistent dark scrim: guarantees 4.5:1 on any backdrop */}
            <div
              className="absolute inset-0 bg-linear-to-t from-primary-deep via-primary-deep/70 to-primary-deep/30"
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 bg-primary-deep/25 mix-blend-multiply"
              aria-hidden="true"
            />

            {/*
              Content column:
              - Narrower side padding on mobile (px-5) that grows with breakpoints,
                and reserves inline space for the arrows via padding rather than
                letting arrows sit on top of text.
              - pb-* trimmed on mobile since the box itself is shorter; grows on
                larger screens where there's headroom to spare.
              - justify-end on mobile keeps content anchored to the bottom near the
                CTA/dots instead of vertically centering into arrow territory.
            */}
            <div className="relative z-20 mx-auto flex h-full max-w-content flex-col justify-end px-5 pb-24 pt-20 sm:justify-center sm:px-14 sm:pb-28 sm:pt-24 md:px-20 md:pb-16 md:pt-20">
              <div className="max-w-md text-content-contrast sm:max-w-lg md:max-w-2xl">
                <span
                  id={`hero-slide-label-${group.slug}`}
                  className="mb-3 inline-flex items-center gap-2 rounded-pill border border-copper/40 bg-primary-deep/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gold backdrop-blur-md sm:mb-5 sm:px-4 sm:py-1.5 sm:text-caption"
                >
                  <GroupGlyph name={group.icon ?? "Sparkles"} className="size-3.5 sm:size-4" strokeWidth={2} />
                  {group.title}
                </span>

                {/*
                  Fluid heading: clamp() scales continuously with viewport width
                  instead of jumping between two fixed sizes, so long titles don't
                  overflow or wrap awkwardly on narrow phones. Tighter leading only
                  kicks in once the heading is reliably single/double line on
                  larger screens.
                */}
                <h2 className="mb-3 font-bold leading-[1.15] text-content-contrast sm:mb-4 sm:leading-[1.1] text-[clamp(1.75rem,5.5vw,3.5rem)]">
                  {group.title}
                </h2>

                {/*
                  Description: clamped to 2 lines on mobile so it can't push the
                  CTA out of the box; full text restored from sm: up where there's
                  vertical room.
                </p> */}
                {group.description ? (
                  <p className="mb-5 line-clamp-2 max-w-sm text-sm text-content-contrast/90 sm:mb-8 sm:line-clamp-none sm:max-w-lg sm:text-body-lead">
                    {group.description}
                  </p>
                ) : null}

                <button
                  type="button"
                  onClick={() => onExplore(group.slug)}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill bg-copper px-6 py-3 text-sm font-semibold text-content-contrast shadow-elevation-3 transition-colors hover:bg-copper-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:min-h-12 sm:px-8 sm:py-4 sm:text-body"
                >
                  {t("pricing.hero.explore", { group: group.title })}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          {/*
            Arrows: smaller and inset on mobile so they never overlap the text
            column above (which now has matching side padding), full size from
            sm: up. Vertically anchored to the image area, not fighting the
            bottom content stack.
          */}
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label={t("pricing.hero.previous")}
            className="absolute inset-s-2 top-[38%] z-30 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-pill border border-content-contrast/40 bg-primary-deep/40 text-content-contrast shadow-elevation-3 backdrop-blur-md transition-all hover:border-content-contrast hover:bg-primary-deep/70 hover:shadow-elevation-4 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:inset-s-4 sm:top-1/2 sm:size-12"
          >
            <ChevronLeft className="size-5 rtl-mirror sm:size-6" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label={t("pricing.hero.next")}
            className="absolute inset-e-2 top-[38%] z-30 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-pill border border-content-contrast/40 bg-primary-deep/40 text-content-contrast shadow-elevation-3 backdrop-blur-md transition-all hover:border-content-contrast hover:bg-primary-deep/70 hover:shadow-elevation-4 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:inset-e-4 sm:top-1/2 sm:size-12"
          >
            <ChevronRight className="size-5 rtl-mirror sm:size-6" aria-hidden="true" />
          </button>

          {/*
            Dots + counter: sit in normal flow near the bottom edge with
            responsive spacing rather than a fixed bottom-8 offset, so they
            don't collide with the CTA on short mobile boxes.
          */}
          <div className="absolute inset-x-0 bottom-4 z-30 flex flex-col items-center gap-1.5 sm:bottom-8 sm:gap-2">
            <p className="text-[11px] font-bold tracking-widest text-content-contrast/90 sm:text-caption">
              {t("pricing.hero.counter", { current: index + 1, total: count })}
            </p>
            <div className="flex gap-1.5 sm:gap-2">
              {groups.map((group, i) => (
                <button
                  key={group.slug}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={t("pricing.hero.goToSlide", {
                    title: group.title,
                  })}
                  aria-current={i === index}
                  className={cn(
                    "h-1.5 rounded-full bg-content-contrast/50 transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:h-2",
                    i === index ? "w-5 bg-content-contrast sm:w-6" : "w-1.5 hover:bg-content-contrast/80 sm:w-2",
                  )}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Visually hidden live region for screen readers */}
      <p className="sr-only" role="status">
        {t("pricing.hero.slideName", { title: current.title })}
      </p>
    </section>
  );
}