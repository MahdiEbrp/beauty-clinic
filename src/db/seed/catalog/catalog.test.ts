import { describe, expect, it } from "vitest";
import { CATALOG_SEED } from "./index";

function group(slug: string) {
  const result = CATALOG_SEED.find((entry) => entry.slug === slug);
  if (!result) throw new Error(`Missing seeded service group: ${slug}`);
  return result;
}

describe("clinic service catalog structure", () => {
  it("creates the five requested face-filler subcategories", () => {
    expect(group("face-filler").categories.map((category) => category.i18n[0].name)).toEqual([
      "ناحیه لب",
      "ناحیه گونه",
      "ناحیه چانه",
      "ناحیه زاویه فک",
      "ناحیه خط خنده",
    ]);
  });

  it("creates the four requested sensitive-filler subcategories", () => {
    expect(group("sensitive-filler").categories.map((category) => category.i18n[0].name)).toEqual([
      "زیر چشم",
      "پیشانی",
      "شقیقه",
      "بینی",
    ]);
  });

  it("keeps the five Botox subcategories in the requested order", () => {
    expect(group("botox").categories.map((category) => category.i18n[0].name)).toEqual([
      "بوتاکس چشم گربه‌ای",
      "بوتاکس لبخند لثه‌ای",
      "بوتاکس فول فیس",
      "بوتاکس تعریق",
      "بوتاکس میگرن",
    ]);
  });

  it.each([
    "body-filler",
    "full-face-filler",
    "enzyme",
    "meso-gel-rejuvenation",
    "laser-hair-removal",
    "hifu",
    "tattoo-removal-skin-brightening",
  ])("keeps %s as one public group with one internal category", (slug) => {
    expect(group(slug).categories).toHaveLength(1);
  });

  it("keeps HIFU visible without inventing a service price", () => {
    const services = group("hifu").categories[0]?.services ?? [];
    expect(services).toHaveLength(1);
    expect(services[0]).toMatchObject({ price: null, priceType: "on_request" });
  });
});
