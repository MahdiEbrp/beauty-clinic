"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/src/i18n/navigation";
import { iconForCatalog } from "@/data/services";
import { pricingImage } from "@/data/pricing-media";
import { cn } from "@/lib/utils";
import type { PublicLanding } from "@/lib/landing";

interface ServicesProps {
  landing: PublicLanding | null;
}

const AUTOPLAY_MS = 6000;

/**
 * Full-bleed, image-backed hero carousel for the services-intro section — one
 * slide per landing service card. Mirrors the pricing HeroSlider structure:
 * autoplay (gated by prefers-reduced-motion), arrows, dots + counter, and the
 * "See {title}" CTA linking into the pricing catalog.
 */
export default function Services({ landing }: ServicesProps) {
  const t = useTranslations("servicesIntro");
  const cards = landing?.serviceCards ?? [];
  const [index, setIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const count = cards.length;
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
      <section
        id="services"
        className="relative aspect-4/5 w-full overflow-hidden bg-primary-deep sm:aspect-video lg:aspect-21/9"
      />
    );
  }


  const current = cards[index];

  return (
    <section
      id="services"
      aria-label={t("label")}
      className="relative w-full overflow-hidden bg-primary-deep"
    >
      <div className="relative aspect-4/5 min-h-105 max-h-180 w-full sm:aspect-video md:max-h-160 lg:aspect-21/9">
        {cards.map((card, i) => {
          const Icon = iconForCatalog(card.icon);
          return (
            <div
              key={card.key}
              role="group"
              aria-roledescription="slide"
              aria-labelledby={`services-slide-label-${card.key}`}
              aria-hidden={i !== index}
              className={cn(
                "absolute inset-0 transition-opacity duration-700",
                i === index ? "z-10 opacity-100" : "z-0 opacity-0",
              )}
            >
              <img
                src={pricingImage(card.image)}
                alt={card.title}
                sizes="100vw"
                fetchPriority={i === 0 ? "high" : undefined}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div
                className="absolute inset-0 bg-linear-to-t from-primary-deep via-primary-deep/70 to-primary-deep/30"
                aria-hidden="true"
              />
              <div
                className="absolute inset-0 bg-primary-deep/25 mix-blend-multiply"
                aria-hidden="true"
              />

              <div className="relative z-20 mx-auto flex h-full max-w-content flex-col justify-end px-5 pb-24 pt-20 sm:justify-center sm:px-14 sm:pb-28 sm:pt-24 md:px-20 md:pb-16 md:pt-20">
                <div className="max-w-md text-content-contrast sm:max-w-lg md:max-w-2xl">
                  <span
                    id={`services-slide-label-${card.key}`}
                    className="mb-3 inline-flex items-center gap-2 self-start rounded-pill border border-copper/40 bg-primary-deep/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gold backdrop-blur-md sm:mb-5 sm:px-4 sm:py-1.5 sm:text-caption"
                  >
                    <Icon className="size-3.5 sm:size-4" strokeWidth={2} aria-hidden="true" />
                    {card.title}
                  </span>

                  <h2 className="mb-3 font-bold leading-[1.15] text-content-contrast sm:mb-4 sm:leading-[1.1] text-[clamp(1.75rem,5.5vw,3.5rem)]">
                    {card.title}
                  </h2>

                  {card.description ? (
                    <p className="mb-5 line-clamp-2 max-w-sm text-sm text-content-contrast/90 sm:mb-8 sm:line-clamp-none sm:max-w-lg sm:text-body-lead">
                      {card.description}
                    </p>
                  ) : null}

                  <Link
                    href={card.href}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill bg-copper px-6 py-3 text-sm font-semibold text-content-contrast no-underline shadow-elevation-3 transition-colors hover:bg-copper-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:min-h-12 sm:px-8 sm:py-4 sm:text-body"
                  >
                    {t("see", { title: card.title })}
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label={t("previous")}
            className="absolute inset-s-2 top-[38%] z-30 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-pill border border-content-contrast/40 bg-primary-deep/40 text-content-contrast shadow-elevation-3 backdrop-blur-md transition-all hover:border-content-contrast hover:bg-primary-deep/70 hover:shadow-elevation-4 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:inset-s-4 sm:top-1/2 sm:size-12"
          >
            <ChevronLeft className="size-5 rtl-mirror sm:size-6" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label={t("next")}
            className="absolute inset-e-2 top-[38%] z-30 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-pill border border-content-contrast/40 bg-primary-deep/40 text-content-contrast shadow-elevation-3 backdrop-blur-md transition-all hover:border-content-contrast hover:bg-primary-deep/70 hover:shadow-elevation-4 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:inset-e-4 sm:top-1/2 sm:size-12"
          >
            <ChevronRight className="size-5 rtl-mirror sm:size-6" aria-hidden="true" />
          </button>

          <div className="absolute inset-x-0 bottom-4 z-30 flex flex-col items-center gap-1.5 sm:bottom-8 sm:gap-2">
            <p className="text-[11px] font-bold tracking-widest text-content-contrast/90 sm:text-caption">
              {t("counter", { current: index + 1, total: count })}
            </p>
            <div className="flex gap-1.5 sm:gap-2">
              {cards.map((card, i) => (
                <button
                  key={card.key}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={t("goToSlide", { title: card.title })}
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

      <p className="sr-only" role="status">
        {t("slideName", { title: current.title })}
      </p>
    </section>
  );
}
