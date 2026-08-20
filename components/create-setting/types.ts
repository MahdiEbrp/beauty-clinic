export type Locale = "en" | "fa";

export type SettingType =
  | "string"
  | "number"
  | "boolean"
  | "object"
  | "array"
  | "localized";

export type FieldErrors = {
  key?: string;
  value?: string;
  faValue?: string;
  enValue?: string;
  displayOrder?: string;
};