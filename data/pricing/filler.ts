export interface PricingItem {
  readonly nameKey: string;
  readonly price: number;
}

export const facialFillerBrands: readonly PricingItem[] = [
  { nameKey: "juvederm", price: 23600 },
  { nameKey: "aliance", price: 22200 },
  { nameKey: "stylish", price: 19500 },
  { nameKey: "rebylgel", price: 15900 },
  { nameKey: "perfecta", price: 7390 },
  { nameKey: "ruofilmPlus", price: 7200 },
  { nameKey: "bella", price: 7100 },
  { nameKey: "innocence", price: 5390 },
  { nameKey: "fiorg", price: 4790 },
  { nameKey: "deMe", price: 4690 },
  { nameKey: "noramis", price: 4490 },
  { nameKey: "dermArgin", price: 4400 },
  { nameKey: "abtq", price: 2390 },
  { nameKey: "rachel", price: 2190 },
  { nameKey: "danyBe", price: 1990 },
  { nameKey: "ruofil", price: 1650 },
  { nameKey: "oridrey", price: 1350 },
] as const;

export const underEyeFillerBrands: readonly PricingItem[] = [
  { nameKey: "innocence", price: 5490 },
  { nameKey: "fiorg", price: 4890 },
  { nameKey: "noramis", price: 4790 },
] as const;

export const fillerPacks10cc: readonly PricingItem[] = [
  { nameKey: "abtq", price: 21900 },
  { nameKey: "rachel", price: 18900 },
  { nameKey: "danyBe", price: 16900 },
  { nameKey: "ruofil", price: 13900 },
  { nameKey: "oridrey", price: 11900 },
] as const;
