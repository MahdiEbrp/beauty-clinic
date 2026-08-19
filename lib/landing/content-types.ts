import type { Locale } from "@/lib/services/types";

export type LandingPageContent = { seoTitle: string | null; seoDescription: string | null };
export type LandingSectionContent = { heading: string; description: string | null };
export type LandingHeroContent = {
  title: string;
  tagline: string | null;
  description: string | null;
  ctaLabel1: string;
  ctaLabel2: string;
};
export type LandingMarqueeItemContent = { text: string };
export type LandingLandingServiceContent = {
  title: string;
  description: string | null;
  ctaLabel: string | null;
};
export type LandingAboutStatContent = { label: string };
export type LandingGalleryItemContent = { caption: string | null; alt: string };

export type LandingServiceContent = LandingLandingServiceContent;

export type LandingTranslated<T> = Record<Locale, T>;
