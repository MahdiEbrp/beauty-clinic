import type { AdminSetting } from "@/lib/settings/admin";

export type SettingSeed = {
  key: string;
  type: string;
  stringValue: string;
  numberValue: string;
  booleanValue: boolean;
  jsonValue: string;
  faValue: string;
  enValue: string;
  displayOrder: string;
  isActive: boolean;
};

const EMPTY: SettingSeed = {
  key: "",
  type: "string",
  stringValue: "",
  numberValue: "",
  booleanValue: true,
  jsonValue: "",
  faValue: "",
  enValue: "",
  displayOrder: "0",
  isActive: true,
};

function stringify(value: unknown): string {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "";
  return JSON.stringify(value);
}

export function seedFromSetting(setting: AdminSetting): SettingSeed {
  return {
    key: setting.key,
    type: setting.type ?? "string",
    stringValue: typeof setting.value === "string" ? setting.value : "",
    numberValue: typeof setting.value === "number" ? String(setting.value) : "",
    booleanValue: typeof setting.value === "boolean" ? setting.value : true,
    jsonValue:
      setting.type !== "string" && typeof setting.value === "object"
        ? JSON.stringify(setting.value)
        : "",
    faValue: stringify(setting.translations?.fa),
    enValue: stringify(setting.translations?.en),
    displayOrder: String(setting.displayOrder),
    isActive: setting.isActive,
  };
}

export function emptySeed(): SettingSeed {
  return EMPTY;
}