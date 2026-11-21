import type { FillerBrand } from "./filler-brands";
import type { SeedCategory } from "./types";

export type FillerAreaDefinition = {
  key: string;
  faName: string;
  enName: string;
  faDescription: string;
  enDescription: string;
};

/**
 * Builds one public category per anatomical area. Prices continue to come
 * from the clinic's existing brand price list; each area receives its own
 * uniquely-slugged service records so descriptions and images can be edited
 * independently in the dashboard.
 */
export function buildFillerAreaCategories(
  areas: readonly FillerAreaDefinition[],
  brands: readonly FillerBrand[],
  slugPrefix: string,
): SeedCategory[] {
  return areas.map((area, categoryIndex) => ({
    slug: `${slugPrefix}-${area.key}`,
    icon: "syringe",
    displayOrder: categoryIndex,
    i18n: [
      {
        locale: "fa",
        name: area.faName,
        description: area.faDescription,
        seoTitle: `${area.faName} | خدمات فیلر`,
        seoDescription: area.faDescription,
      },
      {
        locale: "en",
        name: area.enName,
        description: area.enDescription,
        seoTitle: `${area.enName} | Filler Services`,
        seoDescription: area.enDescription,
      },
    ],
    services: brands.map((brand, serviceIndex) => ({
      slug: `${slugPrefix}-${brand.slug}-${area.key}`,
      price: brand.price,
      priceType: "fixed",
      displayOrder: serviceIndex,
      i18n: [
        {
          locale: "fa",
          title: `${brand.fa} - ${area.faName}`,
          shortDesc: `خدمات فیلر ${area.faName} با برند ${brand.fa}.`,
          seoTitle: `${brand.fa} برای ${area.faName} | قیمت فیلر`,
          seoDescription: `اطلاعات و قیمت فیلر ${area.faName} با برند ${brand.fa}.`,
        },
        {
          locale: "en",
          title: `${brand.en} - ${area.enName}`,
          shortDesc: `${brand.en} filler service for the ${area.enName.toLowerCase()}.`,
          seoTitle: `${brand.en} Filler for ${area.enName} | Price`,
          seoDescription: `Information and pricing for ${brand.en} filler in the ${area.enName.toLowerCase()}.`,
        },
      ],
    })),
  }));
}
