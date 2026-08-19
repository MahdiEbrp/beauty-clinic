import { Sparkles, Heart, Shield, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** Fixed icon map for marquee items. Keys match `landing_marquee_items.icon`. */
export const marqueeIconMap: Record<string, LucideIcon> = {
  Sparkles,
  Heart,
  Shield,
  Zap,
};

export function iconForMarquee(key: string | null): LucideIcon {
  // eslint-disable-next-line security/detect-object-injection -- fixed icon map with safe fallback
  return (key ? marqueeIconMap[key] : undefined) ?? Sparkles;
}
