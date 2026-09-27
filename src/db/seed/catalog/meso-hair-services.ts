import type { SeedCategory } from "./types";
import { svc, withSeo } from "./types";

export const HAIR_MESOTHERAPY_CATEGORY: SeedCategory = {
  slug: "hair-mesotherapy-services",
  icon: "droplet",
  displayOrder: 0,
  i18n: [
    {
      locale: "fa",
      name: "مزوتراپی و تقویت مو",
      description:
        "مزوتراپی و خدمات تقویتی مو برای کاهش ریزش، تقویت ریشه و بهبود کیفیت و تراکم مو؛ متناسب با وضعیت موی شما.",
      seoTitle: "مزوتراپی مو | کاهش ریزش و تقویت ریشه",
      seoDescription:
        "قیمت مزوتراپی مو، هیر فیلر، پی‌آرپی و بوستر برای کاهش ریزش، تقویت ریشه و بهبود تراکم و کیفیت مو.",
    },
    {
      locale: "en",
      name: "Hair Mesotherapy & Strengthening",
      description:
        "Hair mesotherapy and strengthening services to reduce loss, support the roots and improve hair quality and density.",
      seoTitle: "Hair Mesotherapy | Reduce Loss & Strengthen",
      seoDescription:
        "Hair mesotherapy, hair filler, PRP and booster prices to reduce hair loss, support the roots and improve density.",
    },
  ],
  services: [
    withSeo(
      svc("meso-hair-single", "مزوتراپی مو (هر جلسه)", "Hair Mesotherapy (Per Session)", 1_990_000, 0),
      {
        fa: {
          shortDesc: "مزوتراپی مو در هر جلسه برای تقویت ریشه و کاهش ریزش.",
          seoTitle: "مزوتراپی مو | قیمت هر جلسه",
          seoDescription:
            "قیمت مزوتراپی مو در هر جلسه برای تقویت ریشه، کاهش ریزش و بهبود سلامت پوست سر.",
        },
        en: {
          shortDesc: "Per-session hair mesotherapy to strengthen roots and reduce hair loss.",
          seoTitle: "Hair Mesotherapy | Price per Session",
          seoDescription:
            "Per-session hair mesotherapy price to strengthen roots, reduce loss and improve scalp health.",
        },
      },
    ),
    withSeo(
      svc(
        "meso-hair-package-4",
        "پکیج ۴ جلسه مزوتراپی مو",
        "Hair Mesotherapy Package (4 Sessions)",
        5_490_000,
        1,
      ),
      {
        fa: {
          shortDesc: "پکیج ۴ جلسه مزوتراپی مو با صرفه‌جویی و نتیجه‌ای پیوسته‌تر.",
          seoTitle: "پکیج مزوتراپی مو | قیمت ۴ جلسه",
          seoDescription:
            "قیمت پکیج ۴ جلسه مزوتراپی مو برای یک دوره پیوسته، با صرفه‌جویی و نتیجه‌ای بهتر.",
        },
        en: {
          shortDesc: "4-session hair mesotherapy package for a consistent course at a better value.",
          seoTitle: "Hair Mesotherapy Package | 4 Sessions",
          seoDescription:
            "4-session hair mesotherapy package price for a consistent course of treatment at a better value.",
        },
      },
    ),
    withSeo(
      svc("hair-filler-single", "هیر فیلر (هر جلسه)", "Hair Filler (Per Session)", 5_990_000, 2),
      {
        fa: {
          shortDesc: "هیر فیلر در هر جلسه برای ضخیم‌تر شدن و بهبود کیفیت تارهای مو.",
          seoTitle: "هیر فیلر | قیمت هر جلسه",
          seoDescription:
            "قیمت هیر فیلر در هر جلسه برای بهبود ضخامت، کیفیت و ظاهر پرپشت‌تر مو.",
        },
        en: {
          shortDesc: "Per-session hair filler to improve hair thickness and quality.",
          seoTitle: "Hair Filler | Price per Session",
          seoDescription:
            "Per-session hair filler price to improve hair thickness, quality and a fuller appearance.",
        },
      },
    ),
    withSeo(
      svc("prp-hair-session", "پی‌آرپی مو", "Hair PRP", 3_300_000, 3),
      {
        fa: {
          shortDesc: "پی‌آرپی مو با پلاسمای غنی از پلاکت برای تقویت رشد مو.",
          seoTitle: "پی‌آرپی مو | قیمت",
          seoDescription:
            "قیمت پی‌آرپی مو با پلاسمای غنی از پلاکت برای تقویت رشد، ضخامت و سلامت مو.",
        },
        en: {
          shortDesc: "Hair PRP using platelet-rich plasma to support healthier hair growth.",
          seoTitle: "Hair PRP | Price",
          seoDescription:
            "Hair PRP price using platelet-rich plasma to support growth, thickness and healthier hair.",
        },
      },
    ),
    withSeo(
      svc("hair-meso-booster", "بوستر تقویت مو", "Hair Strengthening Booster", 2_890_000, 4),
      {
        fa: {
          shortDesc: "بوستر تقویت مو برای تغذیه ریشه و بهبود تراکم مو.",
          seoTitle: "بوستر تقویت مو | قیمت",
          seoDescription:
            "قیمت بوستر تقویت مو برای تغذیه ریشه، کاهش ریزش و بهبود تراکم و کیفیت مو.",
        },
        en: {
          shortDesc: "Hair strengthening booster to nourish the roots and improve density.",
          seoTitle: "Hair Strengthening Booster | Price",
          seoDescription:
            "Hair strengthening booster price to nourish the roots, reduce loss and improve density and quality.",
        },
      },
    ),
    withSeo(
      svc("meso-scalp-hydration", "مزوتراپی آبرسانی پوست سر", "Scalp Hydration Mesotherapy", 1_690_000, 5),
      {
        fa: {
          shortDesc: "مزوتراپی آبرسانی پوست سر برای سلامت و تعادل پوست سر.",
          seoTitle: "مزوتراپی آبرسانی پوست سر | قیمت",
          seoDescription:
            "قیمت مزوتراپی آبرسانی پوست سر برای سلامت، تعادل و آماده‌سازی پوست سر برای رشد مو.",
        },
        en: {
          shortDesc: "Scalp hydration mesotherapy for a healthy, balanced scalp.",
          seoTitle: "Scalp Hydration Mesotherapy | Price",
          seoDescription:
            "Scalp hydration mesotherapy price for a healthy, balanced scalp that supports hair growth.",
        },
      },
    ),
  ],
};
