import {
  BadgeCheck,
  Bandage,
  Bath,
  Brush,
  Calendar,
  Clock,
  Crown,
  Droplet,
  Droplets,
  Eye,
  Feather,
  Flame,
  Flower,
  Flower2,
  Gem,
  Gift,
  HandHeart,
  Heart,
  HeartPulse,
  Infinity,
  Leaf,
  Microscope,
  Moon,
  Palette,
  Pill,
  Scissors,
  Scan,
  ShieldCheck,
  Smile,
  Snowflake,
  Sparkle,
  Sparkles,
  Star,
  Stethoscope,
  Sun,
  Sunrise,
  Syringe,
  Thermometer,
  Wand2,
  Waves,
  Wind,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { iconNames } from "lucide-react/dynamic";

/**
 * Curated icon choices for the service-group wizard. The `key` is the value
 * stored on `service_groups.icon`; it matches the exported lucide component
 * name so the picker and the catalog viewer resolve to the same glyph.
 */
export const GROUP_ICONS: Array<{ key: string; icon: LucideIcon }> = [
  { key: "Sparkles", icon: Sparkles },
  { key: "Sparkle", icon: Sparkle },
  { key: "Scissors", icon: Scissors },
  { key: "Droplet", icon: Droplet },
  { key: "Droplets", icon: Droplets },
  { key: "Heart", icon: Heart },
  { key: "HeartPulse", icon: HeartPulse },
  { key: "Sun", icon: Sun },
  { key: "Moon", icon: Moon },
  { key: "Flower", icon: Flower },
  { key: "Flower2", icon: Flower2 },
  { key: "Leaf", icon: Leaf },
  { key: "Feather", icon: Feather },
  { key: "Gem", icon: Gem },
  { key: "Wand2", icon: Wand2 },
  { key: "Star", icon: Star },
  { key: "Smile", icon: Smile },
  { key: "Eye", icon: Eye },
  { key: "HandHeart", icon: HandHeart },
  { key: "Zap", icon: Zap },
  { key: "Waves", icon: Waves },
  { key: "Flame", icon: Flame },
  { key: "Snowflake", icon: Snowflake },
  { key: "Wind", icon: Wind },
  { key: "Palette", icon: Palette },
  { key: "Brush", icon: Brush },
  { key: "ShieldCheck", icon: ShieldCheck },
  { key: "BadgeCheck", icon: BadgeCheck },
  { key: "Clock", icon: Clock },
  { key: "Calendar", icon: Calendar },
  { key: "Syringe", icon: Syringe },
  { key: "Stethoscope", icon: Stethoscope },
  { key: "Pill", icon: Pill },
  { key: "Bandage", icon: Bandage },
  { key: "Thermometer", icon: Thermometer },
  { key: "Scan", icon: Scan },
  { key: "Microscope", icon: Microscope },
  { key: "Bath", icon: Bath },
  { key: "Sunrise", icon: Sunrise },
  { key: "Infinity", icon: Infinity },
  { key: "Crown", icon: Crown },
  { key: "Gift", icon: Gift },
];

const normalizeIconName = (name: string): string =>
  name.toLowerCase().replace(/[\s_-]+/g, "");

const pascalFromKebab = (name: string): string =>
  name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

/** Canonical kebab-case names for every icon shipped by lucide. */
export const ICON_NAME_SET: ReadonlySet<string> = new Set(iconNames);

/** Maps legacy PascalCase component names back to their canonical kebab-case name. */
const KEBAB_BY_PASCAL: ReadonlyMap<string, string> = new Map(
  iconNames.map((name) => [pascalFromKebab(name), name]),
);

/** Resolve a curated icon whose canonical name matches the given key. */
const CURATED_BY_CANONICAL: ReadonlyMap<string, LucideIcon> = new Map(
  GROUP_ICONS.flatMap((entry) => {
    const canonical = KEBAB_BY_PASCAL.get(entry.key);
    return canonical ? [[canonical, entry.icon] as const] : [];
  }),
);

/**
 * Normalize any stored icon key (legacy PascalCase or canonical kebab-case) to
 * the canonical lucide kebab-case name, or null when it is not a real icon.
 */
export function canonicalIconName(key: string): string | null {
  if (ICON_NAME_SET.has(key)) return key;
  return KEBAB_BY_PASCAL.get(key) ?? null;
}

/** All lucide icons whose normalized name contains the query, in kebab-case. */
export function searchAllIcons(query: string): Array<string> {
  const needle = normalizeIconName(query);
  if (!needle) return [];
  return iconNames.filter((name) => normalizeIconName(name).includes(needle));
}

/**
 * Resolve a stored icon key to its static lucide component when it is one of
 * the curated choices (a fast, dependency-free path), or null when the key
 * should be rendered lazily through `DynamicIcon` instead.
 */
export function groupIconForKey(key: string | null): LucideIcon | null {
  if (!key) return null;
  const direct = GROUP_ICONS.find((entry) => entry.key === key);
  if (direct) return direct.icon;
  const canonical = canonicalIconName(key);
  return canonical ? CURATED_BY_CANONICAL.get(canonical) ?? null : null;
}