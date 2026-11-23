import type { FillerBrand } from "./filler-brands";
import type { SeedCategory } from "./types";

export type FillerBrandCategoryDefinition = {
  slug: string;
  faName: string;
  enName: string;
  faDescription: string;
  enDescription: string;
};

/**
 * Builds a single price-list category with one service per brand.
 *
 * Anatomical areas belong in the category description/detail content; they
 * must not be expanded into separate copies of the same brand in the public
 * price list. This keeps each clinic price visible exactly once.
 */
export function buildFillerBrandCategory(
  category: FillerBrandCategoryDefinition,
  brands: readonly FillerBrand[],
  slugPrefix: string,
): SeedCategory {
  return {
    slug: category.slug,
    icon: "syringe",
    displayOrder: 0,
    i18n: [
      {
        locale: "fa",
        name: category.faName,
        description: category.faDescription,
        seoTitle: `${category.faName} | قیمت و خدمات فیلر`,
        seoDescription: category.faDescription,
      },
      {
        locale: "en",
        name: category.enName,
        description: category.enDescription,
        seoTitle: `${category.enName} | Filler Prices and Services`,
        seoDescription: category.enDescription,
      },
    ],
    services: brands.map((brand, serviceIndex) => ({
      slug: `${slugPrefix}-${brand.slug}`,
      price: brand.price,
      priceType: "fixed",
      displayOrder: serviceIndex,
      i18n: [
        {
          locale: "fa",
          title: brand.fa,
          shortDesc: `فیلر با برند ${brand.fa}.`,
          seoTitle: `قیمت فیلر ${brand.fa}`,
          seoDescription: `اطلاعات و قیمت فیلر با برند ${brand.fa}.`,
        },
        {
          locale: "en",
          title: brand.en,
          shortDesc: `${brand.en} filler service.`,
          seoTitle: `${brand.en} Filler Price`,
          seoDescription: `Information and pricing for ${brand.en} filler.`,
        },
      ],
    })),
  };
}
