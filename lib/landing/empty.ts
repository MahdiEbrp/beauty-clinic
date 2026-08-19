import type {
  LandingAboutStatContent,
  LandingGalleryItemContent,
  LandingHeroContent,
  LandingMarqueeItemContent,
  LandingPageContent,
  LandingSectionContent,
  LandingServiceContent,
} from "./content-types";

/** Stable fallback content for each translatable landing entity. */
export const emptyPagesContentSentinel: LandingPageContent = { seoTitle: null, seoDescription: null };
export const emptySectionContentSentinel: LandingSectionContent = { heading: "", description: null };
export const emptyHeroContentSentinel: LandingHeroContent = {
  title: "",
  tagline: null,
  description: null,
  ctaLabel1: "",
  ctaLabel2: "",
};
export const emptyMarqueeContentSentinel: LandingMarqueeItemContent = { text: "" };
export const emptyServiceContentSentinel: LandingServiceContent = {
  title: "",
  description: null,
  ctaLabel: null,
};
export const emptyAboutStatContentSentinel: LandingAboutStatContent = { label: "" };
export const emptyGalleryContentSentinel: LandingGalleryItemContent = { caption: null, alt: "" };
