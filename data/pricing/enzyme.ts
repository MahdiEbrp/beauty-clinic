import type { PricingItem } from "./filler";

export const enzymeServices: readonly PricingItem[] = [
  { nameKey: "korean", price: 1290 },
  { nameKey: "english", price: 1690 },
] as const;
