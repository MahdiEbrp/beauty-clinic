// Care-guide wizard — a guide has slug, icon, displayOrder, isActive and a
// localized name + (optional) description. No image/SEO fields.
export type Locale = "en" | "fa";

export type LangContent = {
  name: string;
  description: string;
};

export type FieldErrors = {
  slug?: string;
  enName?: string;
  faName?: string;
};
