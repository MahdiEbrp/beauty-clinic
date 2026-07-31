import type { PricingItem } from "./filler";

export const botoxServices: readonly PricingItem[] = [
  { nameKey: "fullFace", price: 1490 },
  { nameKey: "catEye", price: 1290 },
  { nameKey: "underarm", price: 2500 },
] as const;
