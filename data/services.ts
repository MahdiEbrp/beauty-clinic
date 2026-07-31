import { Droplets, Zap, Flower2, Dumbbell, WandSparkles, Leaf } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const serviceKeys = [
  "facial",
  "laser",
  "antiaging",
  "body",
  "peel",
  "wellness",
] as const;

export type ServiceKey = (typeof serviceKeys)[number];

export const serviceIconMap: Record<ServiceKey, LucideIcon> = {
  facial: Droplets,
  laser: Zap,
  antiaging: Flower2,
  body: Dumbbell,
  peel: WandSparkles,
  wellness: Leaf,
};

export function getServices() {
  return serviceKeys.map((key) => ({
    key,
    tKey: `servicesList.${key}`,
  }));
}
