import type { PricingItem } from "./filler";

export const mesotherapyServices: readonly PricingItem[] = [
  { nameKey: "kiaraMesogel", price: 3890 },
  { nameKey: "royalMesogel", price: 4790 },
  { nameKey: "faceMeso", price: 1550 },
  { nameKey: "hairMeso", price: 1490 },
  { nameKey: "doubleChin", price: 1490 },
  { nameKey: "underEye", price: 1890 },
  { nameKey: "microneedling", price: 1990 },
  { nameKey: "prp", price: 3100 },
  { nameKey: "hairFiller", price: 4890 },
] as const;

export const jalproProducts: readonly PricingItem[] = [
  { nameKey: "pink", price: 12900 },
  { nameKey: "eyeClassic", price: 11900 },
  { nameKey: "superHydro", price: 19900 },
  { nameKey: "youngEye", price: 15890 },
] as const;

export const profhilo: readonly PricingItem[] = [
  { nameKey: "profhilo", price: 16290 },
] as const;
