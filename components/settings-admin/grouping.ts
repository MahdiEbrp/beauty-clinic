import {
  CalendarClock,
  HelpCircle,
  MapPin,
  Receipt,
  Share2,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";

export type SettingGroupId =
  | "booking"
  | "contact"
  | "pricing"
  | "social"
  | "other"
  | "unknown";

export type SettingGroupDef = {
  id: SettingGroupId;
  titleKey: string;
  subtitleKey: string;
  icon: LucideIcon;
  prefixes: string[];
};

export const SETTING_GROUPS: SettingGroupDef[] = [
  {
    id: "booking",
    titleKey: "settingsAdmin.groups.booking.title",
    subtitleKey: "settingsAdmin.groups.booking.subtitle",
    icon: CalendarClock,
    prefixes: ["booking"],
  },
  {
    id: "contact",
    titleKey: "settingsAdmin.groups.contact.title",
    subtitleKey: "settingsAdmin.groups.contact.subtitle",
    icon: MapPin,
    prefixes: ["contact"],
  },
  {
    id: "pricing",
    titleKey: "settingsAdmin.groups.pricing.title",
    subtitleKey: "settingsAdmin.groups.pricing.subtitle",
    icon: Receipt,
    prefixes: ["pricing"],
  },
  {
    id: "social",
    titleKey: "settingsAdmin.groups.social.title",
    subtitleKey: "settingsAdmin.groups.social.subtitle",
    icon: Share2,
    prefixes: ["social"],
  },
  {
    id: "other",
    titleKey: "settingsAdmin.groups.other.title",
    subtitleKey: "settingsAdmin.groups.other.subtitle",
    icon: SlidersHorizontal,
    prefixes: ["clinic", "common"],
  },
  {
    id: "unknown",
    titleKey: "settingsAdmin.groups.unknown.title",
    subtitleKey: "settingsAdmin.groups.unknown.subtitle",
    icon: HelpCircle,
    prefixes: [],
  },
];

export const GROUP_IDS: readonly SettingGroupId[] = SETTING_GROUPS.map(
  (group) => group.id,
);

/** Returns the group a setting key belongs to, falling back to "unknown". */
export function groupOfKey(key: string): SettingGroupId {
  const prefix = key.split(".")[0];
  for (const group of SETTING_GROUPS) {
    if (group.prefixes.includes(prefix)) return group.id;
  }
  return "unknown";
}