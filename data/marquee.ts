import { Sparkles, Heart, Shield, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type MarqueeItem = {
  key: string;
  icon: LucideIcon;
};

export const marqueeItems: MarqueeItem[] = [
  { key: "clearSkin", icon: Sparkles },
  { key: "lastingYouth", icon: Heart },
  { key: "expertise", icon: Shield },
  { key: "technology", icon: Zap },
];
