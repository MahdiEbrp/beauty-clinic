/**
 * Shared shapes for the service catalog.
 *
 * Localized content is stored per locale in the DB *_i18n tables (see
 * src/db/schema). Admin reads return a `translations` object carrying both
 * fa/en content, plus `*Key`-less shorthand fields (`name`, `title`, ...)
 * mirroring `translations.fa`.
 */

export type PriceType = "fixed" | "from" | "on_request";
export type ServiceImageType = "before" | "after" | "gallery";

export type ServiceListItem = {
  id: string;
  slug: string;
  titleKey: string;
  price: number | null;
  priceType: PriceType;
  durationMin: number | null;
  sessionsCount: number;
  isFeatured: boolean;
};

export type ServiceCategoryNode = {
  id: string;
  slug: string;
  nameKey: string;
  descriptionKey: string | null;
  icon: string | null;
  displayOrder: number;
  services: ServiceListItem[];
};

export type ServiceGroupNode = {
  id: string;
  slug: string;
  nameKey: string;
  descriptionKey: string | null;
  icon: string | null;
  displayOrder: number;
  categories: ServiceCategoryNode[];
};

export type ServiceDetailImage = {
  imageUrl: string;
  type: ServiceImageType;
  displayOrder: number;
};

export type ServiceDetailFaq = {
  questionKey: string;
  answerKey: string;
  displayOrder: number;
};

export type ServiceDetailData = {
  id: string;
  slug: string;
  titleKey: string;
  shortDescKey: string | null;
  fullDescKey: string | null;
  price: number | null;
  priceType: PriceType;
  durationMin: number | null;
  sessionsCount: number;
  coverImage: string | null;
  isFeatured: boolean;
  images: ServiceDetailImage[];
  faqs: ServiceDetailFaq[];
  category: { slug: string; nameKey: string; descriptionKey: string | null } | null;
  group: { slug: string; nameKey: string } | null;
};

// ---------------------------------------------------------------------------
// Admin (dashboard) shapes for the service catalog CRUD.
// ---------------------------------------------------------------------------

export type Locale = "fa" | "en";

export type TranslatedContent<T> = { fa: T; en: T };

/** Localized fields of a service group. */
export type ServiceGroupContent = {
  name: string;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

/** Localized fields of a service category (same shape as a group). */
export type ServiceCategoryContent = ServiceGroupContent;

/** Localized fields of a service. */
export type ServiceContent = {
  title: string;
  shortDesc: string | null;
  fullDesc: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

/** Localized fields of a service FAQ. */
export type ServiceFaqContent = {
  question: string;
  answer: string;
};

export type AdminServiceGroup = {
  id: string;
  slug: string;
  icon: string | null;
  image: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  categoryCount: number;
  /** Shorthand for `translations.fa` kept for list display and dialogs. */
  name: string;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  translations: TranslatedContent<ServiceGroupContent>;
};

export type AdminServiceCategory = {
  id: string;
  groupId: string;
  groupName: string;
  slug: string;
  icon: string | null;
  image: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  serviceCount: number;
  /** Shorthand for `translations.fa`. */
  name: string;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  translations: TranslatedContent<ServiceCategoryContent>;
};

export type AdminServiceImage = {
  id: string;
  serviceId: string;
  imageUrl: string;
  type: ServiceImageType;
  displayOrder: number;
  createdAt: Date;
};

export type AdminServiceFaq = {
  id: string;
  serviceId: string;
  displayOrder: number;
  createdAt: Date;
  /** Shorthand for `translations.fa`. */
  question: string;
  answer: string;
  translations: TranslatedContent<ServiceFaqContent>;
};

export type AdminService = {
  id: string;
  categoryId: string;
  categoryName: string;
  groupId: string;
  groupName: string;
  slug: string;
  price: number | null;
  priceType: PriceType;
  durationMin: number | null;
  sessionsCount: number;
  coverImage: string | null;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
  /** Shorthand for `translations.fa`. */
  title: string;
  shortDesc: string | null;
  fullDesc: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  translations: TranslatedContent<ServiceContent>;
  images: AdminServiceImage[];
  faqs: AdminServiceFaq[];
};

export type ListServicesResult = {
  items: AdminService[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export type ListServiceGroupsResult = {
  items: AdminServiceGroup[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export type ListServiceCategoriesResult = {
  items: AdminServiceCategory[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export type ServiceCatalogSummary = {
  groups: AdminServiceGroup[];
  categories: AdminServiceCategory[];
  totalServices: number;
};

// Public (marketing site) catalog shapes live in `public-types.ts`.
export * from "./public-types";
