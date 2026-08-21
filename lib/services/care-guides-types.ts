import type { TranslatedContent } from "./types";

export type CareGuideContent = {
  name: string;
  description: string | null;
};

export type CareGuideItemContent = {
  title: string;
  description: string | null;
};

export type AdminCareGuide = {
  id: string;
  slug: string;
  icon: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  itemCount: number;
  /** Shorthand for `translations.fa`. */
  name: string;
  description: string | null;
  translations: TranslatedContent<CareGuideContent>;
};

export type AdminCareGuideItem = {
  id: string;
  guideId: string;
  guideName: string;
  highlighted: boolean;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  /** Shorthand for `translations.fa`. */
  title: string;
  description: string | null;
  translations: TranslatedContent<CareGuideItemContent>;
};

export type ListCareGuidesResult = {
  items: AdminCareGuide[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export type ListCareGuideItemsResult = {
  items: AdminCareGuideItem[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

/** A localized care guide (with its items) rendered on the public /care page. */
export type PublicCareGuide = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  displayOrder: number;
  items: PublicCareGuideItem[];
};

export type PublicCareGuideItem = {
  id: string;
  title: string;
  description: string | null;
  highlighted: boolean;
  displayOrder: number;
};

export type CareGuideOption = {
  id: string;
  name: string;
};
