"use client";

import { useEffect, useState } from "react";
import PricingJumpSidebar from "./PricingJumpSidebar";
import PricingJumpMobile from "./PricingJumpMobile";

export type PricingJumpNavProps = {
  groups: { slug: string; title: string; count?: number }[];
  label?: string;
  className?: string;
  dir?: "ltr" | "rtl";
  sectionsLabel?: string;
  scrollTopLabel?: string;
  itemLabel?: string;
};

/**
 * Editorial Dual-Mode Pricing Jump Navigation:
 * - Large Screens (>= lg): Fixed Start/Sidebar Navigation (sticky to top viewport)
 *   with an editorial Table of Contents list, active indicators, and counts.
 * - Small/Medium Screens (< lg): Sticky Bottom Action Bar with quick-jump
 *   active capsule, drawer trigger, and back-to-top button. Zero horizontal
 *   scrollbar clipping.
 *
 * All text is supplied via props so the caller (PricingArticle) drives it
 * through `next-intl` `t()` keys — no hardcoded strings here. State and
 * observers live here; the DOM is delegated to the two focused sub-components.
 */
export default function PricingJumpNav({
  groups = [],
  label = "",
  className,
  dir = "ltr",
  sectionsLabel = "",
  scrollTopLabel = "",
  itemLabel = "",
}: PricingJumpNavProps) {
  const [active, setActive] = useState<string>(groups[0]?.slug || "");

  // IntersectionObserver to sync scroll position with the active group.
  useEffect(() => {
    if (groups.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id.replace(/^pricing-/, ""));
          }
        }
      },
      { rootMargin: "-15% 0px -60% 0px", threshold: 0.1 }
    );
    groups.forEach((group) => {
      const el = document.getElementById(`pricing-${group.slug}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [groups]);

  if (groups.length === 0) return null;

  const activeIndex = groups.findIndex((g) => g.slug === active);

  const handleJump = (slug: string) => {
    setActive(slug);
    const el = document.getElementById(`pricing-${slug}`);
    if (el) {
      const offset = 90;
      const top = el.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: top - offset, behavior: "smooth" });
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      <PricingJumpSidebar
        groups={groups}
        label={label}
        dir={dir}
        active={active}
        onJump={handleJump}
        onScrollTop={scrollToTop}
        sectionsLabel={sectionsLabel}
        scrollTopLabel={scrollTopLabel}
        itemLabel={itemLabel}
        className={className}
      />

      <PricingJumpMobile
        groups={groups}
        label={label}
        dir={dir}
        active={active}
        activeIndex={activeIndex}
        sectionsLabel={sectionsLabel}
        scrollTopLabel={scrollTopLabel}
        onJump={handleJump}
        onScrollTop={scrollToTop}
      />
    </>
  );
}

export { PricingJumpNav };
