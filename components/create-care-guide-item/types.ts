export type Locale = "en" | "fa";

export type LangContent = {
  title: string;
  description: string;
};

export type FieldErrors = {
  guideId?: string;
  enTitle?: string;
  faTitle?: string;
};

export type GuideOption = { id: string; name: string };
