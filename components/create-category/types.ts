import type {
  LangContent,
  LangSeo,
  Locale,
} from "../create-group/types";

export type { LangContent, LangSeo, Locale };

export type GroupOption = { id: string; name: string };

export type FieldErrors = {
  slug?: string;
  enName?: string;
  faName?: string;
  groupId?: string;
};
