import type { Locale, TranslatedContent } from "@/lib/services/types";

export type LandingCollectionKey = "marquee" | "services" | "stats" | "gallery";

export type LandingMarqueeContent = { text: string };
export type LandingServiceCardContent = {
  title: string;
  description: string | null;
  ctaLabel: string | null;
};
export type LandingStatContent = { label: string };
export type LandingGalleryContent = { caption: string | null; alt: string };

export type AdminHero = {
  image: string | null;
  taglineIcon: string | null;
  translations: TranslatedContent<{
    title: string;
    tagline: string | null;
    description: string | null;
    ctaLabel1: string;
    ctaLabel2: string;
  }>;
};

export type AdminLandingSeo = {
  translations: TranslatedContent<{ seoTitle: string | null; seoDescription: string | null }>;
};

export type AdminLandingSection = {
  key: string;
  heading: string;
  description: string | null;
  translations: TranslatedContent<{ heading: string; description: string | null }>;
};

export type AdminLandingSettings = {
  seo: AdminLandingSeo;
  sections: AdminLandingSection[];
};

export type AdminMarqueeItem = {
  id: string;
  key: string;
  icon: string | null;
  displayOrder: number;
  isActive: boolean;
  text: string;
  translations: TranslatedContent<LandingMarqueeContent>;
};

export type AdminServiceCard = {
  id: string;
  key: string;
  serviceId: string | null;
  icon: string | null;
  image: string | null;
  displayOrder: number;
  isActive: boolean;
  title: string;
  description: string | null;
  ctaLabel: string | null;
  translations: TranslatedContent<LandingServiceCardContent>;
};

export type AdminAboutStat = {
  id: string;
  key: string;
  value: number;
  compact: boolean;
  plus: boolean;
  displayOrder: number;
  isActive: boolean;
  label: string;
  translations: TranslatedContent<LandingStatContent>;
};

export type AdminGalleryItem = {
  id: string;
  key: string;
  imageUrl: string;
  displayOrder: number;
  isActive: boolean;
  caption: string | null;
  alt: string;
  translations: TranslatedContent<LandingGalleryContent>;
};

export type AdminCollectionRow =
  | AdminMarqueeItem
  | AdminServiceCard
  | AdminAboutStat
  | AdminGalleryItem;

export type LandingListResult<T> = {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export type LandingAdminOverview = {
  active: number;
  sections: number;
  marquee: number;
  services: number;
  stats: number;
  gallery: number;
  hasPages: boolean;
};

export { type Locale };
