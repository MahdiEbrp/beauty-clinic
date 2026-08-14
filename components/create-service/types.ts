export type PriceType = "fixed" | "from" | "on_request";

export type Locale = "en" | "fa";

export type LangContent = {
  title: string;
  shortDesc: string;
  fullDesc: string;
};

export type LangSeo = {
  title: string;
  description: string;
};

export type CategoryOption = {
  id: string;
  name: string;
  groupId: string;
  groupName: string;
};

export type ServiceWizardSeed = {
  categoryId: string;
  content: Record<Locale, LangContent>;
  seo: Record<Locale, LangSeo>;
  slugDraft: string;
  slugManual: boolean;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: string;
  price: string | null;
  priceType: PriceType;
  durationMin: string | null;
  sessionsCount: string;
  coverImage: string;
};

export type FieldErrors = {
  slug?: string;
  enTitle?: string;
  faTitle?: string;
  categoryId?: string;
};

export type ReviewExtra = {
  label: string;
  value?: string;
};
