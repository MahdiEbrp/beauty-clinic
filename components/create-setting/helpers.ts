import type { SettingType } from "./types";

export const STEPS = [
  { id: 1, key: "identity" },
  { id: 2, key: "value" },
  { id: 3, key: "settings" },
  { id: 4, key: "review" },
] as const;

/** Steps that expose the en/fa language switcher (localized value editing). */
export const LANG_AWARE_STEPS = new Set<number>([2]);

export const SETTING_TYPES: readonly SettingType[] = [
  "string",
  "number",
  "boolean",
  "object",
  "array",
  "localized",
];

export const KEY_PATTERN = /^[a-z][a-z0-9_.]*$/;

export const LOCALES: readonly ("en" | "fa")[] = ["en", "fa"] as const;