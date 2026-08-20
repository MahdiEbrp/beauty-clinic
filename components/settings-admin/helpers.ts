import type { AdminSetting } from "@/lib/settings/admin";

export type SettingStatus = "active" | "inactive";

export function statusOf(setting: AdminSetting): SettingStatus {
  return setting.isActive ? "active" : "inactive";
}

export const statusClass: Record<SettingStatus, string> = {
  active: "bg-success/10 text-success border-success/30",
  inactive: "bg-surface-tertiary text-content-secondary border-border-primary",
};

export function previewValue(setting: AdminSetting, locale: "fa" | "en"): string {
  if (setting.type === "localized") {
    const value = setting.translations?.[locale];
    return value === undefined ? "—" : typeof value === "string" ? value : JSON.stringify(value);
  }
  if (typeof setting.value === "string") return setting.value;
  if (setting.value === null || setting.value === undefined) return "—";
  if (typeof setting.value === "object") return JSON.stringify(setting.value);
  return String(setting.value);
}

export function formatJson(value: unknown): string {
  if (value === undefined) return "—";
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}