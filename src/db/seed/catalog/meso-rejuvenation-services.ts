import type { SeedCategory } from "./types";
import { svc, withSeo } from "./types";

/**
 * "مزوژل - مزو مو - جوانساز - درمان پوستی" — Mahdi's price list (20 items).
 */
export const MESOTHERAPY_CATEGORY: SeedCategory = {
  slug: "meso-gel-rejuvenation",
  icon: "rejuvenation",
  displayOrder: 0,
  i18n: [
    {
      locale: "fa",
      name: "مزوژل - مزو مو - جوانساز - درمان پوستی",
      description:
        "مزوتراپی، مزوژل و جوانسازها برای آبرسانی عمیق، بهبود کیفیت و شادابی پوست و تقویت مو؛ متناسب با نیاز شما.",
      seoTitle: "مزوژل و جوانساز | قیمت هر جلسه",
      seoDescription:
        "قیمت مزوتراپی، مزوژل، جالپرو، پروفایلو، پی‌آر‌پی و جوانسازها برای آبرسانی، شادابی و جوان‌تر شدن پوست و تقویت مو.",
    },
    {
      locale: "en",
      name: "Mesogel - Hair Meso - Rejuvenation - Skin Treatment",
      description:
        "Mesotherapy, mesogel and skin boosters for deep hydration, quality and radiance, plus rejuvenators tailored to your needs.",
      seoTitle: "Mesogel & Rejuvenation | Price per Session",
      seoDescription:
        "Mesotherapy, mesogel, Jalupro, Profhilo and PRP prices for hydration, radiance and younger-looking skin and stronger hair.",
    },
  ],
  services: [
    withSeo(svc("mesogel-kiara", "مزوژل کیارا", "Kiara Mesogel", 3_900_000, 0), {
      fa: {
        shortDesc: "مزوژل کیارا برای آبرسانی عمیق و بهبود کیفیت و شادابی پوست.",
        seoTitle: "مزوژل کیارا | قیمت",
        seoDescription: "قیمت و مشاوره تزریق مزوژل کیارا برای آبرسانی عمیق و بهبود کیفیت و شادابی پوست.",
      },
      en: {
        shortDesc: "Kiara mesogel for deep hydration to improve skin quality and radiance.",
        seoTitle: "Kiara Mesogel | Price",
        seoDescription: "Kiara mesogel price and consultation for deep hydration and improved skin quality and radiance.",
      },
    }),
    withSeo(svc("mesogel-provage", "مزوژل پروایج", "Provage Mesogel", 5_790_000, 1), {
      fa: {
        shortDesc: "مزوژل پرووایج برای آبرسانی و جوان‌سازی پوست با ترکیبات بازسازنده.",
        seoTitle: "مزوژل پروایج | قیمت",
        seoDescription: "قیمت و مشاوره تزریق مزوژل پرووایج برای آبرسانی و جوان‌سازی پوست با ترکیبات بازسازنده.",
      },
      en: {
        shortDesc: "Provage mesogel to hydrate and rejuvenate skin with restorative ingredients.",
        seoTitle: "Provage Mesogel | Price",
        seoDescription: "Provage mesogel price and consultation for hydration and rejuvenation with restorative ingredients.",
      },
    }),
    withSeo(svc("meso-face", "مزوتراپی صورت", "Face Mesotherapy", 1_990_000, 2), {
      fa: {
        shortDesc: "مزوتراپی صورت برای آبرسانی و شادابی پوست صورت.",
        seoTitle: "مزوتراپی صورت | قیمت",
        seoDescription: "قیمت و مشاوره مزوتراپی صورت برای آبرسانی عمیق و شادابی پوست صورت.",
      },
      en: {
        shortDesc: "Face mesotherapy to hydrate and refresh facial skin.",
        seoTitle: "Face Mesotherapy | Price",
        seoDescription: "Face mesotherapy price and consultation for deep hydration and refreshed facial skin.",
      },
    }),
    withSeo(svc("meso-undereye", "مزوتراپی زیر چشم", "Undereye Mesotherapy", 1_990_000, 3), {
      fa: {
        shortDesc: "مزوتراپی زیر چشم برای بهبود تیرگی، گودی و شادابی ناحیه زیر چشم.",
        seoTitle: "مزوتراپی زیر چشم | قیمت",
        seoDescription: "قیمت و مشاوره مزوتراپی زیر چشم برای بهبود تیرگی، گودی و شادابی ناحیه زیر چشم.",
      },
      en: {
        shortDesc: "Undereye mesotherapy to improve dark circles, hollowness and radiance under the eyes.",
        seoTitle: "Undereye Mesotherapy | Price",
        seoDescription: "Undereye mesotherapy price to improve dark circles, hollowness and radiance under the eyes.",
      },
    }),
    withSeo(svc("prp-skin", "پی آر پی پوست", "Skin PRP", 3_400_000, 4), {
      fa: {
        shortDesc: "پی آر پی پوست با پلاسمای خون خودتان برای جوان‌سازی و بازسازی پوست.",
        seoTitle: "پی آر پی پوست | قیمت",
        seoDescription: "قیمت و مشاوره پی آر پی پوست با پلاسمای خون خودتان برای جوان‌سازی و بازسازی پوست.",
      },
      en: {
        shortDesc: "Skin PRP uses your own blood plasma to rejuvenate and regenerate the skin.",
        seoTitle: "Skin PRP | Price",
        seoDescription: "Skin PRP price and consultation using your own blood plasma for skin rejuvenation and regeneration.",
      },
    }),
    withSeo(svc("meso-eyebrow", "مزو ابرو", "Eyebrow Meso", 1_990_000, 5), {
      fa: {
        shortDesc: "مزو ابرو برای تقویت رشد، ضخامت و پر شدن ابروها.",
        seoTitle: "مزو ابرو | قیمت",
        seoDescription: "قیمت و مشاوره مزو ابرو برای تقویت رشد، ضخامت و پر شدن ابروها.",
      },
      en: {
        shortDesc: "Eyebrow meso to strengthen growth, thickness and fullness of the brows.",
        seoTitle: "Eyebrow Meso | Price",
        seoDescription: "Eyebrow meso price and consultation to strengthen growth, thickness and fullness of the brows.",
      },
    }),
    withSeo(svc("meso-hair", "مزو مو", "Hair Meso", 1_990_000, 6), {
      fa: {
        shortDesc: "مزو مو برای تقویت ریشه، کاهش ریزش و بهبود کیفیت و تراکم مو.",
        seoTitle: "مزو مو | قیمت",
        seoDescription: "قیمت و مشاوره مزو مو برای تقویت ریشه، کاهش ریزش و بهبود کیفیت و تراکم مو.",
      },
      en: {
        shortDesc: "Hair meso to strengthen the roots, reduce hair loss and improve hair quality and density.",
        seoTitle: "Hair Meso | Price",
        seoDescription: "Hair meso price and consultation to strengthen roots, reduce hair loss and improve hair quality and density.",
      },
    }),
    withSeo(svc("meso-double-chin", "مزو چربی‌سوز غبغب", "Double Chin Fat-Dissolving Meso", 1_990_000, 7), {
      fa: {
        shortDesc: "مزو چربی‌سوز غبغب برای کاهش چربی موضعی و فرم‌دهی ناحیه زیر چانه.",
        seoTitle: "مزو چربی‌سوز غبغب | قیمت",
        seoDescription: "قیمت و مشاوره مزو چربی‌سوز غبغب برای کاهش چربی موضعی و فرم‌دهی ناحیه زیر چانه.",
      },
      en: {
        shortDesc: "Double chin fat-dissolving meso to reduce localized fat and refine the area under the chin.",
        seoTitle: "Double Chin Fat-Dissolving Meso | Price",
        seoDescription: "Double chin fat-dissolving meso price to reduce localized fat and refine the area under the chin.",
      },
    }),
    withSeo(svc("prp-hair", "پی آر پی مو", "Hair PRP", 3_300_000, 8), {
      fa: {
        shortDesc: "پی آر پی مو با پلاسمای خون خودتان برای تقویت ریشه و کاهش ریزش مو.",
        seoTitle: "پی آر پی مو | قیمت",
        seoDescription: "قیمت و مشاوره پی آر پی مو با پلاسمای خون خودتان برای تقویت ریشه و کاهش ریزش مو.",
      },
      en: {
        shortDesc: "Hair PRP uses your own blood plasma to strengthen the roots and reduce hair loss.",
        seoTitle: "Hair PRP | Price",
        seoDescription: "Hair PRP price and consultation using your own blood plasma to strengthen roots and reduce hair loss.",
      },
    }),
    withSeo(svc("hair-filler", "هیر فیلر", "Hair Filler", 5_990_000, 9), {
      fa: {
        shortDesc: "هیر فیلر برای تقویت رشد، ضخامت و سلامت موهای سر.",
        seoTitle: "هیر فیلر | قیمت",
        seoDescription: "قیمت و مشاوره تزریق هیر فیلر برای تقویت رشد، ضخامت و سلامت موهای سر.",
      },
      en: {
        shortDesc: "Hair filler to strengthen growth, density and the overall health of scalp hair.",
        seoTitle: "Hair Filler | Price",
        seoDescription: "Hair filler price and consultation to strengthen growth, density and overall scalp hair health.",
      },
    }),
    withSeo(svc("meso-needling", "مزونیدلینگ", "Meso Needling", 2_390_000, 10), {
      fa: {
        shortDesc: "مزونیدلینگ برای تحریک کلاژن‌سازی و بهبود بافت و کیفیت پوست.",
        seoTitle: "مزونیدلینگ | قیمت",
        seoDescription: "قیمت و مشاوره مزونیدلینگ برای تحریک کلاژن‌سازی و بهبود بافت و کیفیت پوست.",
      },
      en: {
        shortDesc: "Meso needling to stimulate collagen and improve skin texture and quality.",
        seoTitle: "Meso Needling | Price",
        seoDescription: "Meso needling price and consultation to stimulate collagen and improve skin texture and quality.",
      },
    }),
    withSeo(svc("subcision", "سابسیژن", "Subcision", 5_900_000, 11), {
      fa: {
        shortDesc: "سابسیژن برای آزادسازی رشته‌های فیبروزی و بهبود فرم و بافت پوست.",
        seoTitle: "سابسیژن | قیمت",
        seoDescription: "قیمت و مشاوره سابسیژن برای آزادسازی رشته‌های فیبروزی و بهبود فرم و بافت پوست.",
      },
      en: {
        shortDesc: "Subcision to release fibrotic bands and improve skin texture and contour.",
        seoTitle: "Subcision | Price",
        seoDescription: "Subcision price and consultation to release fibrotic bands and improve skin texture and contour.",
      },
    }),
    withSeo(svc("jalupro-hmw", "جالبرو HMW (جوانساز و آبرسان)", "Jalupro HMW", 14_900_000, 12), {
      fa: {
        shortDesc: "جالبرو HMW جوانساز و آبرسان قوی برای بازسازی و آبرسانی عمیق پوست.",
        seoTitle: "جالبرو HMW | قیمت",
        seoDescription: "قیمت و مشاوره تزریق جالبرو HMW جوانساز و آبرسان قوی برای بازسازی و آبرسانی عمیق پوست.",
      },
      en: {
        shortDesc: "Jalupro HMW — a powerful rejuvenator and hydrator for deep skin regeneration.",
        seoTitle: "Jalupro HMW | Price",
        seoDescription: "Jalupro HMW price and consultation — a powerful rejuvenator and hydrator for deep skin regeneration.",
      },
    }),
    withSeo(
      svc("jalupro-classic", "جالبرو کلاسیک (بازسازی بافت‌های خشک و آسیب‌دیده پوست)", "Jalupro Classic", 13_900_000, 13),
      {
        fa: {
          shortDesc: "جالبرو کلاسیک برای بازسازی بافت‌های خشک و آسیب‌دیده پوست.",
          seoTitle: "جالبرو کلاسیک | قیمت",
          seoDescription: "قیمت و مشاوره تزریق جالبرو کلاسیک برای بازسازی بافت‌های خشک و آسیب‌دیده پوست.",
        },
        en: {
          shortDesc: "Jalupro Classic to regenerate dry and damaged skin tissue.",
          seoTitle: "Jalupro Classic | Price",
          seoDescription: "Jalupro Classic price and consultation to regenerate dry and damaged skin tissue.",
        },
      },
    ),
    withSeo(
      svc("jalupro-super-hydro", "جالبرو سوپر هیدرو (کلاژن‌ساز و جوانساز قوی)", "Jalupro Super Hydro", 22_900_000, 14),
      {
        fa: {
          shortDesc: "جالبرو سوپر هیدرو کلاژن‌ساز و جوانساز قوی برای آبرسانی فوق‌عمیق و شادابی پوست.",
          seoTitle: "جالبرو سوپر هیدرو | قیمت",
          seoDescription: "قیمت و مشاوره تزریق جالبرو سوپر هیدرو کلاژن‌ساز و جوانساز قوی برای آبرسانی فوق‌عمیق و شادابی پوست.",
        },
        en: {
          shortDesc: "Jalupro Super Hydro — a strong collagen booster and rejuvenator for deep hydration and radiance.",
          seoTitle: "Jalupro Super Hydro | Price",
          seoDescription: "Jalupro Super Hydro price — a strong collagen booster and rejuvenator for deep hydration and radiant skin.",
        },
      },
    ),
    withSeo(
      svc("profhilo-structure", "پروفایلو استراکچرا (لیفت و جوانسازی صورت)", "Profhilo Structure", 23_900_000, 15),
      {
        fa: {
          shortDesc: "پروفایلو استراکچرا برای لیفت و جوانسازی صورت و بازسازی کلاژن پوست.",
          seoTitle: "پروفایلو استراکچرا | قیمت",
          seoDescription: "قیمت و مشاوره تزریق پروفایلو استراکچرا برای لیفت و جوانسازی صورت و بازسازی کلاژن پوست.",
        },
        en: {
          shortDesc: "Profhilo Structure for facial lifting and rejuvenation through collagen remodeling.",
          seoTitle: "Profhilo Structure | Price",
          seoDescription: "Profhilo Structure price and consultation for facial lifting and rejuvenation through collagen remodeling.",
        },
      },
    ),
    withSeo(
      svc("profhilo-classic", "پروفایلو کلاسیک (آبرسان و جوانساز قوی)", "Profhilo Classic", 19_900_000, 16),
      {
        fa: {
          shortDesc: "پروفایلو کلاسیک آبرسان و جوانساز قوی برای آبرسانی عمیق، سفت‌شدن و جوان‌سازی پوست.",
          seoTitle: "پروفایلو کلاسیک | قیمت",
          seoDescription: "قیمت و مشاوره تزریق پروفایلو کلاسیک آبرسان و جوانساز قوی برای آبرسانی عمیق و جوان‌سازی پوست.",
        },
        en: {
          shortDesc: "Profhilo Classic — a strong hydrator and rejuvenator for deep hydration, firming and renewal.",
          seoTitle: "Profhilo Classic | Price",
          seoDescription: "Profhilo Classic price and consultation — a strong hydrator and rejuvenator for deep hydration and firming.",
        },
      },
    ),
    withSeo(
      svc("liquid-thread", "نخ مایع (PLLA - کلاژن‌ساز تزریقی)", "Liquid Thread (PLLA)", 23_900_000, 17),
      {
        fa: {
          shortDesc: "نخ مایع (PLLA) کلاژن‌ساز تزریقی برای جوان‌سازی و سفت‌شدن تدریجی پوست.",
          seoTitle: "نخ مایع (PLLA) | قیمت",
          seoDescription: "قیمت و مشاوره تزریق نخ مایع (PLLA) کلاژن‌ساز تزریقی برای جوان‌سازی و سفت‌شدن تدریجی پوست.",
        },
        en: {
          shortDesc: "Liquid thread (PLLA) — an injectable collagen booster for gradual rejuvenation and firming.",
          seoTitle: "Liquid Thread (PLLA) | Price",
          seoDescription: "Liquid thread (PLLA) price — an injectable collagen booster for gradual rejuvenation and firming of the skin.",
        },
      },
    ),
    withSeo(svc("luxiva", "لوکسیوا (بهبود بافت و کاهش خطوط ریز)", "Luxiva", 5_900_000, 18), {
      fa: {
        shortDesc: "لوکسیوا برای بهبود بافت و کاهش خطوط ریز پوست.",
        seoTitle: "لوکسیوا | قیمت",
        seoDescription: "قیمت و مشاوره تزریق لوکسیوا برای بهبود بافت و کاهش خطوط ریز پوست.",
      },
      en: {
        shortDesc: "Luxiva to improve skin texture and reduce fine lines.",
        seoTitle: "Luxiva | Price",
        seoDescription: "Luxiva price and consultation to improve skin texture and reduce fine lines.",
      },
    }),
    withSeo(svc("deminu", "دیمنو (مزوژل با اثر شبه‌بوتاکس)", "Deminu", 18_900_000, 19), {
      fa: {
        shortDesc: "دیمنو مزوژلی با اثر شبه‌بوتاکس برای کاهش خطوط و جوان‌سازی پوست.",
        seoTitle: "دیمنو | قیمت",
        seoDescription: "قیمت و مشاوره تزریق دیمنو مزوژل با اثر شبه‌بوتاکس برای کاهش خطوط و جوان‌سازی پوست.",
      },
      en: {
        shortDesc: "Deminu — a mesogel with a Botox-like effect to soften lines and rejuvenate the skin.",
        seoTitle: "Deminu | Price",
        seoDescription: "Deminu price and consultation — a mesogel with a Botox-like effect to soften lines and rejuvenate the skin.",
      },
    }),
  ],
};
