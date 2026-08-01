"use client";

import { useTranslations } from "next-intl";
import { marqueeItems } from "@/data/marquee";
import { Marquee, MarqueeContent, MarqueeItem } from "@/components/ui/marquee";

/**
 * Scrolling brand banner.
 *
 * `autoFill` is required: without it the track is only as wide as its content
 * (~850px), so viewports wider than two tracks showed an empty gap scrolling
 * past. autoFill also makes the scroll rate equal `speed` in px/sec at every
 * viewport width, instead of drifting with the container size.
 *
 * `speed={34}` reproduces the previous 25s/850px cadence.
 *
 * Accessibility: the moving copy is marked `aria-hidden` and the same phrases
 * are exposed once to assistive tech via the `sr-only` list below, so autoFill's
 * repetition is never read out. `pauseOnHover` + `pauseOnKeyboard` satisfy
 * WCAG 2.2.2 (Pause, Stop, Hide) for motion lasting more than 5 seconds.
 */
export default function MarqueeBanner() {
  const t = useTranslations();

  return (
    <Marquee
      autoFill
      speed={34}
      gap="3rem"
      pauseOnHover
      pauseOnKeyboard
      aria-label={t("marquee.label")}
      className="bg-accent text-surface-primary py-5 rounded-none focus-visible:ring-inset focus-visible:ring-gold/70"
    >
      <MarqueeContent>
        {marqueeItems.map((item) => {
          const Icon = item.icon;
          return (
            <MarqueeItem
              key={item.key}
              aria-hidden="true"
              className="flex items-center gap-4 text-body-lead font-semibold tracking-wide"
            >
              <Icon className="w-5 h-5 text-gold shrink-0" strokeWidth={2} />
              <span>{t(`marqueeItems.${item.key}`)}</span>
            </MarqueeItem>
          );
        })}
      </MarqueeContent>

      <ul className="sr-only">
        {marqueeItems.map((item) => (
          <li key={item.key}>{t(`marqueeItems.${item.key}`)}</li>
        ))}
      </ul>
    </Marquee>
  );
}
