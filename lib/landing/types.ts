/** Localized SEO metadata for the landing page. */
export type LandingSeo = {
  title: string | null;
  description: string | null;
};

/** Localized hero content. */
export type PublicHero = {
  image: string | null;
  taglineIcon: string | null;
  title: string;
  tagline: string | null;
  description: string | null;
  ctaLabel1: string;
  ctaLabel2: string;
};

/** A marquee banner item (text is localized, icon is not). */
export type PublicMarqueeItem = {
  key: string;
  icon: string | null;
  text: string;
};

/** A services-intro card localized for one locale. */
export type PublicLandingService = {
  key: string;
  icon: string | null;
  image: string | null;
  title: string;
  description: string | null;
  ctaLabel: string | null;
  /** Links into the shared catalog/pricing flow. */
  href: "/pricing";
};

/** A reusable section header (heading + description). */
export type PublicSection = {
  key: string;
  heading: string;
  description: string | null;
};

/** An about-section statistic with its localized label. */
export type PublicAboutStat = {
  key: string;
  value: number;
  compact: boolean;
  plus: boolean;
  label: string;
};

/** A gallery image (url is not localized, alt/caption are). */
export type PublicGalleryItem = {
  key: string;
  imageUrl: string;
  caption: string | null;
  alt: string;
};

/** Fully localized landing-page data for one locale. */
export type PublicLanding = {
  seo: LandingSeo;
  hero: PublicHero;
  marqueeItems: PublicMarqueeItem[];
  services: PublicSection | null;
  serviceCards: PublicLandingService[];
  about: PublicSection | null;
  aboutStats: PublicAboutStat[];
  gallery: PublicSection | null;
  galleryItems: PublicGalleryItem[];
  contact: PublicSection | null;
};

/** Translated content of a landing section row. */
export type LandingSectionContent = {
  heading: string;
  description: string | null;
};
