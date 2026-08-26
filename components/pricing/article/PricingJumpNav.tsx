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
  useEffect(() => {
    if (groups.length === 0) return;

    const getActiveSlug = () => {
      const offset = 140; // matches your scroll offset + some buffer
      let current = groups[0]?.slug || "";

      for (const group of groups) {
        const el = document.getElementById(`pricing-${group.slug}`);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top - offset <= 0) {
          current = group.slug;
        } else {
          break;
        }
      }
      return current;
    };

    const handleScroll = () => {
      setActive(getActiveSlug());
    };

    handleScroll(); // set initial state
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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
