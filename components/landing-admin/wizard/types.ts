import type { Locale } from "@/lib/services/types";

export type WizardLangContent = Record<Locale, Record<string, string>>;

export type FieldErrors = Record<string, string>;
