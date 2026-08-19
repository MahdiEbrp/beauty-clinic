import type {
  AdminAboutStat,
  AdminGalleryItem,
  AdminHero,
  AdminLandingSection,
  AdminLandingSeo,
  AdminMarqueeItem,
  AdminServiceCard,
} from "./types";
import type {
  LandingAboutStatContent,
  LandingGalleryItemContent,
  LandingHeroContent,
  LandingMarqueeItemContent,
  LandingSectionContent,
  LandingServiceContent,
  LandingTranslated,
} from "../content-types";

const EMPTY_HERO: LandingHeroContent = {
  title: "",
  tagline: null,
  description: null,
  ctaLabel1: "",
  ctaLabel2: "",
};

export function mapMarqueeItem(
  row: { id: string; key: string; icon: string | null; displayOrder: number; isActive: boolean },
  tr: LandingTranslated<LandingMarqueeItemContent> | undefined,
): AdminMarqueeItem {
  const fa = tr?.fa ?? { text: "" };
  const en = tr?.en ?? { text: "" };
  return {
    id: row.id,
    key: row.key,
    icon: row.icon,
    displayOrder: row.displayOrder,
    isActive: row.isActive,
    text: fa.text,
    translations: { fa, en },
  };
}

export function mapServiceCard(
  row: {
    id: string;
    key: string;
    serviceId: string | null;
    icon: string | null;
    image: string | null;
    displayOrder: number;
    isActive: boolean;
  },
  tr: LandingTranslated<LandingServiceContent> | undefined,
): AdminServiceCard {
  const fa = tr?.fa ?? { title: "", description: null, ctaLabel: null };
  const en = tr?.en ?? { title: "", description: null, ctaLabel: null };
  return {
    id: row.id,
    key: row.key,
    serviceId: row.serviceId,
    icon: row.icon,
    image: row.image,
    displayOrder: row.displayOrder,
    isActive: row.isActive,
    title: fa.title,
    description: fa.description ?? null,
    ctaLabel: fa.ctaLabel ?? null,
    translations: { fa, en },
  };
}

export function mapAboutStat(
  row: {
    id: string;
    key: string;
    value: number;
    compact: boolean;
    plus: boolean;
    displayOrder: number;
    isActive: boolean;
  },
  tr: LandingTranslated<LandingAboutStatContent> | undefined,
): AdminAboutStat {
  const fa = tr?.fa ?? { label: "" };
  const en = tr?.en ?? { label: "" };
  return {
    id: row.id,
    key: row.key,
    value: row.value,
    compact: row.compact,
    plus: row.plus,
    displayOrder: row.displayOrder,
    isActive: row.isActive,
    label: fa.label,
    translations: { fa, en },
  };
}

export function mapGalleryItem(
  row: {
    id: string;
    key: string;
    imageUrl: string;
    displayOrder: number;
    isActive: boolean;
  },
  tr: LandingTranslated<LandingGalleryItemContent> | undefined,
): AdminGalleryItem {
  const fa = tr?.fa ?? { caption: null, alt: "" };
  const en = tr?.en ?? { caption: null, alt: "" };
  return {
    id: row.id,
    key: row.key,
    imageUrl: row.imageUrl,
    displayOrder: row.displayOrder,
    isActive: row.isActive,
    caption: fa.caption ?? null,
    alt: fa.alt,
    translations: { fa, en },
  };
}

export function mapHero(
  row: { image: string | null; taglineIcon: string | null },
  tr: LandingTranslated<LandingHeroContent> | undefined,
): AdminHero {
  const fa = tr?.fa ?? EMPTY_HERO;
  const en = tr?.en ?? EMPTY_HERO;
  return {
    image: row.image,
    taglineIcon: row.taglineIcon,
    translations: { fa, en },
  };
}

export function mapLandingSeo(
  rows: Array<{ locale: string; seoTitle: string | null; seoDescription: string | null }>,
): AdminLandingSeo {
  const fa = rows.find((r) => r.locale === "fa") ?? { seoTitle: null, seoDescription: null };
  const en = rows.find((r) => r.locale === "en") ?? { seoTitle: null, seoDescription: null };
  return {
    translations: {
      fa: { seoTitle: fa.seoTitle, seoDescription: fa.seoDescription },
      en: { seoTitle: en.seoTitle, seoDescription: en.seoDescription },
    },
  };
}

export function mapLandingSection(
  row: { key: string },
  tr: LandingTranslated<LandingSectionContent> | undefined,
): AdminLandingSection | null {
  if (!tr) return null;
  const fa = tr.fa ?? { heading: "", description: null };
  const en = tr.en ?? { heading: "", description: null };
  return {
    key: row.key,
    heading: fa.heading,
    description: fa.description ?? null,
    translations: { fa, en },
  };
}
