import { Droplets, Zap, Flower2, Dumbbell, WandSparkles, Leaf, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Icon lookup for DB-driven catalog entries. Keys match the `icon` values
 * stored on `service_groups` / `service_categories`; unknown or null values
 * fall back to a neutral icon.
 */
export const serviceIconMap: Record<string, LucideIcon> = {
  facial: Droplets,
  laser: Zap,
  antiaging: Flower2,
  body: Dumbbell,
  peel: WandSparkles,
  wellness: Leaf,
  gelBotox: Droplets,
  rejuvenation: WandSparkles,
  bodyFiller: Dumbbell,
  hifu: Zap,
  microneedling: Leaf,
};

export function iconForCatalog(icon: string | null): LucideIcon {

  return (icon ? serviceIconMap[icon] : undefined) ?? Sparkles;
}