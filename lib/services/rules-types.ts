import type { TranslatedContent } from "./types";

export type RuleContent = {
  name: string;
  description: string | null;
};

export type AdminRule = {
  id: string;
  slug: string;
  icon: string | null;
  image: string | null;
  color: string | null;
  highlighted: boolean;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  description: string | null;
  translations: TranslatedContent<RuleContent>;
};

export type ListRulesResult = {
  items: AdminRule[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

/** A localized rule rendered on the public clinic-rules page. */
export type PublicRule = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  image: string | null;
  color: string | null;
  highlighted: boolean;
  displayOrder: number;
};
