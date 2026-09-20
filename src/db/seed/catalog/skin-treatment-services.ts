import type { SeedCategory } from "./types";
import { svc, withSeo } from "./types";

export const SKIN_TREATMENT_SERVICES_CATEGORY: SeedCategory = {
  slug: "skin-treatment-services",
  icon: "sparkles",
  displayOrder: 0,
  i18n: [
    {
      locale: "fa",
      name: "درمان‌های پوستی",
      description:
        "خدمات تخصصی درمان پوست برای بهبود بافت، لک، جوش و شادابی؛ متناسب با نوع پوست و نیاز شما.",
      seoTitle: "درمان‌های پوستی | بافت، لک و شادابی",
      seoDescription:
        "قیمت خدمات درمانی پوست مانند هایفو، میکرونیدلینگ، هیدرافیشیال و پیلینگ برای بهبود بافت، لک و شادابی پوست.",
    },
    {
      locale: "en",
      name: "Skin Treatments",
      description:
        "Specialized skin treatments to improve texture, pigmentation, acne and radiance, tailored to your skin.",
      seoTitle: "Skin Treatments | Texture, Pigmentation & Radiance",
      seoDescription:
        "Skin treatment prices for HIFU, microneedling, HydraFacial and peels to improve texture, pigmentation and radiance.",
    },
  ],
  services: [
    withSeo(
      svc("skin-hifu", "هایفوتراپی صورت", "Face HIFU Therapy", 8_900_000, 0, "from"),
      {
        fa: {
          shortDesc: "هایفوتراپی صورت برای سفتی و لیفت ملایم پوست بدون جراحی.",
          seoTitle: "هایفوتراپی صورت | قیمت",
          seoDescription:
            "قیمت هایفوتراپی صورت برای سفتی، لیفت ملایم و بهبود کیفیت پوست بدون جراحی.",
        },
        en: {
          shortDesc: "Face HIFU to firm and subtly lift the skin without surgery.",
          seoTitle: "Face HIFU Therapy | Price",
          seoDescription:
            "Face HIFU therapy price to firm, subtly lift and improve skin quality without surgery.",
        },
      },
    ),
    withSeo(
      svc("skin-microneedling", "میکرونیدلینگ", "Microneedling", 2_490_000, 1),
      {
        fa: {
          shortDesc: "میکرونیدلینگ برای بازسازی پوست، بهبود بافت و کاهش جای جوش.",
          seoTitle: "میکرونیدلینگ | قیمت",
          seoDescription:
            "قیمت میکرونیدلینگ برای بازسازی پوست، بهبود بافت، کاهش جای جوش و افزایش شادابی.",
        },
        en: {
          shortDesc: "Microneedling to resurface skin, improve texture and reduce acne scars.",
          seoTitle: "Microneedling | Price",
          seoDescription:
            "Microneedling price to resurface skin, improve texture, reduce acne scars and boost radiance.",
        },
      },
    ),
    withSeo(
      svc("skin-hydrafacial", "هیدرافیشیال", "HydraFacial", 2_900_000, 2),
      {
        fa: {
          shortDesc: "هیدرافیشیال برای پاکسازی عمیق، آبرسانی و درخشندگی فوری پوست.",
          seoTitle: "هیدرافیشیال | قیمت",
          seoDescription:
            "قیمت هیدرافیشیال برای پاکسازی عمیق، آبرسانی و درخشندگی فوری پوست بدون دوره بازیابی.",
        },
        en: {
          shortDesc: "HydraFacial for deep cleansing, hydration and an immediate glow.",
          seoTitle: "HydraFacial | Price",
          seoDescription:
            "HydraFacial price for deep cleansing, hydration and an immediate glow with no downtime.",
        },
      },
    ),
    withSeo(
      svc("skin-chemical-peel", "پیلینگ شیمیایی", "Chemical Peel", 1_890_000, 3),
      {
        fa: {
          shortDesc: "پیلینگ شیمیایی برای روشن‌سازی، یکدست‌سازی و شادابی پوست.",
          seoTitle: "پیلینگ شیمیایی | قیمت",
          seoDescription:
            "قیمت پیلینگ شیمیایی برای روشن‌سازی، یکدست‌سازی رنگ پوست و بهبود بافت و شادابی.",
        },
        en: {
          shortDesc: "Chemical peel to brighten, even out tone and refresh the skin.",
          seoTitle: "Chemical Peel | Price",
          seoDescription:
            "Chemical peel price to brighten, even out skin tone and improve texture and radiance.",
        },
      },
    ),
    withSeo(
      svc("skin-fractional-laser", "لیزر فراکشنال", "Fractional Laser", 4_900_000, 4, "from"),
      {
        fa: {
          shortDesc: "لیزر فراکشنال برای بازسازی پوست، کاهش منافذ و جای جوش.",
          seoTitle: "لیزر فراکشنال | قیمت",
          seoDescription:
            "قیمت لیزر فراکشنال برای بازسازی پوست، کاهش منافذ باز، جای جوش و بهبود بافت پوست.",
        },
        en: {
          shortDesc: "Fractional laser to resurface skin, refine pores and reduce acne scars.",
          seoTitle: "Fractional Laser | Price",
          seoDescription:
            "Fractional laser price to resurface skin, refine pores, reduce acne scars and improve texture.",
        },
      },
    ),
    withSeo(
      svc("skin-meso-glow", "مزوتراپی شفاف‌سازی پوست", "Skin Glow Mesotherapy", 2_100_000, 5),
      {
        fa: {
          shortDesc: "مزوتراپی شفاف‌سازی برای درخشندگی و یکدستی رنگ پوست.",
          seoTitle: "مزوتراپی شفاف‌سازی پوست | قیمت",
          seoDescription:
            "قیمت مزوتراپی شفاف‌سازی پوست برای درخشندگی، یکدستی رنگ و بهبود کیفیت پوست.",
        },
        en: {
          shortDesc: "Glow mesotherapy for radiance and a more even skin tone.",
          seoTitle: "Skin Glow Mesotherapy | Price",
          seoDescription:
            "Skin glow mesotherapy price for radiance, a more even tone and improved skin quality.",
        },
      },
    ),
    withSeo(
      svc("skin-acne-treatment", "درمان آکنه و جوش", "Acne Treatment", 2_490_000, 6),
      {
        fa: {
          shortDesc: "درمان آکنه و جوش برای کنترل، کاهش التهاب و پیشگیری از جای جوش.",
          seoTitle: "درمان آکنه و جوش | قیمت",
          seoDescription:
            "قیمت درمان آکنه و جوش برای کنترل، کاهش التهاب و پیشگیری از ایجاد جای جوش.",
        },
        en: {
          shortDesc: "Acne treatment to control breakouts, reduce inflammation and prevent scarring.",
          seoTitle: "Acne Treatment | Price",
          seoDescription:
            "Acne treatment price to control breakouts, reduce inflammation and help prevent scarring.",
        },
      },
    ),
  ],
};
