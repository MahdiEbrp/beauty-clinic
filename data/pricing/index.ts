export interface PricingItem {
  readonly nameKey: string;
  readonly price: number;
}

export interface PricingCategory {
  readonly key: string;
  readonly nameKey: string;
  readonly descriptionKey: string;
  readonly items: readonly PricingItem[];
  readonly noteKey?: string;
}

import { facialFillerBrands, underEyeFillerBrands, fillerPacks10cc } from "./filler";
import { botoxServices } from "./botox";
import { enzymeServices } from "./enzyme";
import { bodyFillerServices } from "./body-filler";
import { mesotherapyServices, jalproProducts, profhilo } from "./mesotherapy";
import { laserSections } from "./laser";

const mesoAllItems = [
  ...mesotherapyServices,
  ...jalproProducts,
  ...profhilo,
];

export const pricingCategories: readonly PricingCategory[] = [
  {
    key: "facial_filler",
    nameKey: "facial_filler",
    descriptionKey: "facial_filler_desc",
    items: facialFillerBrands,
  },
  {
    key: "under_eye_filler",
    nameKey: "under_eye_filler",
    descriptionKey: "under_eye_filler_desc",
    items: underEyeFillerBrands,
  },
  {
    key: "filler_packs",
    nameKey: "filler_packs",
    descriptionKey: "filler_packs_desc",
    items: fillerPacks10cc,
    noteKey: "filler_packs_note",
  },
  {
    key: "botox",
    nameKey: "botox",
    descriptionKey: "botox_desc",
    items: botoxServices,
  },
  {
    key: "enzyme",
    nameKey: "enzyme",
    descriptionKey: "enzyme_desc",
    items: enzymeServices,
  },
  {
    key: "body_filler",
    nameKey: "body_filler",
    descriptionKey: "body_filler_desc",
    items: bodyFillerServices,
  },
  {
    key: "mesotherapy",
    nameKey: "mesotherapy",
    descriptionKey: "mesotherapy_desc",
    items: mesoAllItems,
  },
  {
    key: "laser",
    nameKey: "laser",
    descriptionKey: "laser_desc",
    items: laserSections.flatMap((s) => s.items),
  },
] as const;

export function getPricingCategories() {
  return pricingCategories;
}

export function getPricingCategory(key: string) {
  return pricingCategories.find((c) => c.key === key);
}
