export type Locale = "en" | "fa";

export type LangContent = {
  name: string;
  description: string;
};

export type LangSeo = {
  title: string;
  description: string;
};

export type FieldErrors = {
  slug?: string;
  enName?: string;
  faName?: string;
};
