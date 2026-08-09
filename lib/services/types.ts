/**
 * Shared shapes for the service catalog.
 *
 * The DB stores *translation keys* (e.g. `servicesPage.services.gelBotox.title`)
 * in the name/title/description columns; components resolve them via next-intl
 * `t()` so the same row works for both locales.
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

export type AdminServiceGroup = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image: string | null;
  displayOrder: number;
  isActive: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: Date;
  updatedAt: Date;
  categoryCount: number;
};

export type AdminServiceCategory = {
  id: string;
  groupId: string;
  groupName: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image: string | null;
  displayOrder: number;
  isActive: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: Date;
  updatedAt: Date;
  serviceCount: number;
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
  question: string;
  answer: string;
  displayOrder: number;
  createdAt: Date;
};

export type AdminService = {
  id: string;
  categoryId: string;
  categoryName: string;
  groupId: string;
  groupName: string;
  title: string;
  slug: string;
  shortDesc: string | null;
  fullDesc: string | null;
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

export type ServiceCatalogSummary = {
  groups: AdminServiceGroup[];
  categories: AdminServiceCategory[];
  totalServices: number;
};
