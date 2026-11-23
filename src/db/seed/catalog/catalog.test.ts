import { describe, expect, it } from "vitest";
import { CATALOG_SEED } from "./index";

function group(slug: string) {
  const result = CATALOG_SEED.find((entry) => entry.slug === slug);
  if (!result) throw new Error(`Missing seeded service group: ${slug}`);
  return result;
}

describe("clinic service catalog structure", () => {
  it("lists each face-filler brand exactly once in the clinic price-list category", () => {
    const categories = group("face-filler").categories;
    expect(categories).toHaveLength(1);
    expect(categories[0]?.i18n[0]?.name).toBe("فیلر لب و صورت");
    const services = categories[0]?.services ?? [];
    expect(services).toHaveLength(15);
    expect(new Set(services.map((service) => service.slug)).size).toBe(15);
    expect(services.map((service) => service.i18n[0]?.title)).toEqual([
      "ژوویدرم",
      "الانسه",
      "استایلیج",
      "ریلن",
      "پرفکتا",
      "رووفیل پلاس",
      "اینووسنس",
      "فیورج",
      "دی می",
      "درم آرکان",
      "اپی تی کیو",
      "زیشل",
      "دنبی",
      "رووفیل",
      "اودری",
    ]);
  });

  it("lists each sensitive-area filler brand exactly once", () => {
    const categories = group("sensitive-filler").categories;
    expect(categories).toHaveLength(1);
    expect(categories[0]?.i18n[0]?.name).toBe("فیلر زیرچشم - شقیقه - بینی - پیشانی");
    const services = categories[0]?.services ?? [];
    expect(services).toHaveLength(3);
    expect(new Set(services.map((service) => service.slug)).size).toBe(3);
  });

  it("keeps the five Botox subcategories in the requested order", () => {
    const categories = [...group("botox").categories].sort(
      (a, b) => a.displayOrder - b.displayOrder,
    );
    expect(categories.map((category) => category.i18n[0].name)).toEqual([
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
