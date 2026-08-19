"use client";

import { useTranslations } from "next-intl";
import { iconForMarquee } from "@/data/landing-icons";
import { Marquee, MarqueeContent, MarqueeItem } from "@/components/ui/marquee";
import type { PublicLanding } from "@/lib/landing";

interface MarqueeBannerProps {
  landing: PublicLanding | null;
}

/**
 * Scrolling brand banner. Marquee item text is DB-driven (localized via
 * `landing_marquee_items_i18n`); icons are static lucide glyphs.
 *
 * `autoFill` ensures the track fills wide viewports and makes scroll rate equal
 * `speed` in px/sec everywhere. Accessibility: the moving copy is `aria-hidden`
 * and exposed once via `sr-only`; `pauseOnHover`/`pauseOnKeyboard` satisfy
 * WCAG 2.2.2.
 */
export default function MarqueeBanner({ landing }: MarqueeBannerProps) {
  const t = useTranslations("marquee");
  const items = landing?.marqueeItems ?? [];

  if (items.length === 0) return null;

  return (
    <Marquee
      autoFill
      speed={34}
      gap="3rem"
      pauseOnHover
      pauseOnKeyboard
      aria-label={t("label")}
      className="bg-accent text-surface-primary py-5 rounded-none focus-visible:ring-inset focus-visible:ring-gold/70"
    >
      <MarqueeContent>
        {items.map((item) => {
          const Icon = iconForMarquee(item.icon);
          return (
            <MarqueeItem
              key={item.key}
              aria-hidden="true"
              className="flex items-center gap-4 text-body-lead font-semibold tracking-wide"
            >
              <Icon className="w-5 h-5 text-gold shrink-0" strokeWidth={2} />
              <span>{item.text}</span>
            </MarqueeItem>
          );
        })}
      </MarqueeContent>

      {items.length > 0 && (
        <ul className="sr-only">
          {items.map((item) => (
            <li key={item.key}>{item.text}</li>
          ))}
        </ul>
      )}
    </Marquee>
  );
}
