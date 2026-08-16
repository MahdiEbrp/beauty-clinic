import type { SeedGroup } from "./types";
import { svc, withSeo } from "./types";

export const MESOTHERAPY_GROUP: SeedGroup = {
  slug: "mesotherapy-skin-rejuvenation",
  icon: "leaf",
  image: "/images/gallery/microneedling.webp",
  displayOrder: 5,
  i18n: [
    {
      locale: "fa",
      name: "مزو و جوانسازی",
      description:
        "با درمان‌های تخصصی مزوتراپی و جوانسازی، به بهبود آبرسانی، کیفیت، شادابی و انعطاف‌پذیری پوست کمک کنید و ظاهری تازه‌تر و درخشان‌تر داشته باشید.",
      seoTitle: "مزو و جوانسازی | مزوتراپی و درمان‌های پیشرفته پوست",
      seoDescription:
        "خدمات مزوتراپی، مزوژل، نیدلینگ، پی‌آر‌پی، جالپرو و پروفایلو برای بهبود آبرسانی، کیفیت، شادابی و جوان‌تر شدن ظاهر پوست.",
    },
    {
      locale: "en",
      name: "Mesotherapy & Skin Rejuvenation",
      description:
        "Refresh, hydrate, and revitalize your skin with personalized rejuvenation treatments designed to improve skin quality, elasticity, radiance, and overall vitality.",
      seoTitle: "Mesotherapy & Skin Rejuvenation | Advanced Aesthetic Treatme",
      seoDescription:
        "Discover personalized mesotherapy, skin boosters, microneedling, PRP, Jalupro and Profhilo treatments designed to refresh, hydrate and revitalize your skin.",
    },
  ],
  categories: [
    {
      slug: "meso-per-session-rejuvenation",
      icon: "leaf",
      displayOrder: 0,
      i18n: [
        {
          locale: "fa",
          name: "مزو (هرجلسه) - مزوژل - جوانساز",
          description:
            "مزوتراپی و مزوژل برای آبرسانی، بهبود کیفیت و شادابی پوست؛ به‌همراه درمان‌های جوانسازی برای ظاهری تازه‌تر و درخشان‌تر.",
          seoTitle: "مزو و مزوژل | قیمت هر جلسه و جوانسازی پوست",
          seoDescription:
            "قیمت مزوتراپی، مزوژل، نیدلینگ، پی‌آر‌پی، جالپرو و پروفایلو برای آبرسانی، شادابی و جوان‌تر شدن ظاهر پوست.",
        },
        {
          locale: "en",
          name: "Meso (Per Session) - Mesogel - Rejuvenation",
          description:
            "Mesotherapy and skin boosters for hydration, quality and radiance, plus rejuvenation treatments for a fresher, brighter look.",
          seoTitle: "Meso & Mesogel | Price per Session & Skin Rejuvenation",
          seoDescription:
            "Mesotherapy, mesogel, microneedling, PRP, Jalupro and Profhilo prices for hydration, radiance and younger-looking skin.",
        },
      ],
      services: [
        withSeo(svc("mesogel-kiara", "مزوژل کیارا", "Kiara Mesogel", 3_890_000, 0), {
          fa: {
            shortDesc: "مزوژل کیارا برای آبرسانی عمیق و بهبود کیفیت و شادابی پوست.",
            seoTitle: "مزوژل کیارا | قیمت تزریق",
            seoDescription:
              "قیمت و مشاوره تزریق مزوژل کیارا (Kiara) برای آبرسانی عمیق و بهبود کیفیت و شادابی پوست.",
          },
          en: {
            shortDesc: "Kiara mesogel for deep hydration to improve skin quality and radiance.",
            seoTitle: "Kiara Mesogel | Price",
            seoDescription:
              "Kiara mesogel price and consultation for deep hydration to improve skin quality and radiance.",
          },
        }),
        withSeo(svc("mesogel-provage", "مزوژل پرووایج", "Provage Mesogel", 4_790_000, 1), {
          fa: {
            shortDesc: "مزوژل پرووایج برای آبرسانی و جوان‌سازی پوست با ترکیبات بازسازنده.",
            seoTitle: "مزوژل پرووایج | قیمت تزریق",
            seoDescription:
              "قیمت و مشاوره تزریق مزوژل پرووایج (Provage) برای آبرسانی، بازسازی و جوان‌سازی پوست.",
          },
          en: {
            shortDesc: "Provage mesogel to hydrate and rejuvenate skin with restorative ingredients.",
            seoTitle: "Provage Mesogel | Price",
            seoDescription: "Provage mesogel price for hydrating, restoring and rejuvenating the skin.",
          },
        }),
        withSeo(svc("meso-face", "مزو صورت", "Face Meso", 1_550_000, 2), {
          fa: {
            shortDesc: "مزو صورت برای آبرسانی و شادابی پوست صورت.",
            seoTitle: "مزو صورت | قیمت تزریق",
            seoDescription: "قیمت و مشاوره مزوتراپی صورت برای آبرسانی، شادابی و بهبود کیفیت پوست.",
          },
          en: {
            shortDesc: "Face meso to hydrate and refresh facial skin.",
            seoTitle: "Face Meso | Price",
            seoDescription: "Face mesotherapy price for hydration and refreshed, healthy-looking skin.",
          },
        }),
        withSeo(svc("meso-hair-eyebrow", "مزو (مو - مزوابرو)", "Meso (Hair - Eyebrow)", 1_490_000, 3), {
          fa: {
            shortDesc: "مزو مو و ابرو برای تقویت رشد، ضخامت و سلامت مو.",
            seoTitle: "مزو مو و ابرو | قیمت",
            seoDescription: "قیمت و مشاوره مزوتراپی مو و ابرو برای تقویت رشد، ضخامت و سلامت مو.",
          },
          en: {
            shortDesc: "Hair and eyebrow meso to strengthen growth and improve hair density and thickness.",
            seoTitle: "Hair & Eyebrow Meso | Price",
            seoDescription: "Hair and eyebrow mesotherapy price to strengthen growth, thickness and scalp health.",
          },
        }),
        withSeo(svc("meso-sideburn", "مزو غبغب", "Double Chin Meso", 1_490_000, 4), {
          fa: {
            shortDesc: "مزو غبغب برای سفت‌کردن و بهبود فرم ناحیه زیر چانه.",
            seoTitle: "مزو غبغب | قیمت",
            seoDescription: "قیمت و مشاوره مزوتراپی غبغب برای سفت‌کردن و بهبود فرم ناحیه زیر چانه.",
          },
          en: {
            shortDesc: "Double chin meso to firm and refine the area under the chin.",
            seoTitle: "Double Chin Meso | Price",
            seoDescription: "Double chin mesotherapy price to firm and improve definition under the chin.",
          },
        }),
        withSeo(svc("meso-undereye", "مزو زیرچشم", "Undereye Meso", 1_890_000, 5), {
          fa: {
            shortDesc: "مزو زیرچشم برای بهبود تیرگی، گودی و شادابی ناحیه زیر چشم.",
            seoTitle: "مزو زیرچشم | قیمت",
            seoDescription: "قیمت و مشاوره مزوتراپی زیرچشم برای بهبود تیرگی، گودی و شادابی ناحیه زیر چشم.",
          },
          en: {
            shortDesc: "Undereye meso to improve dark circles, hollowness and radiance under the eyes.",
            seoTitle: "Undereye Meso | Price",
            seoDescription: "Undereye mesotherapy price to improve dark circles, hollowness and under-eye radiance.",
          },
        }),
        withSeo(svc("meso-needling", "مزونیدلینگ", "Meso Needling", 1_990_000, 6), {
          fa: {
            shortDesc: "مزونیدلینگ برای تحریک کلاژن‌سازی و بهبود بافت و کیفیت پوست.",
            seoTitle: "مزونیدلینگ | قیمت",
            seoDescription: "قیمت و مشاوره مزونیدلینگ برای تحریک کلاژن‌سازی و بهبود بافت، لک و کیفیت پوست.",
          },
          en: {
            shortDesc: "Meso needling to stimulate collagen and improve skin texture and quality.",
            seoTitle: "Meso Needling | Price",
            seoDescription: "Meso needling price to stimulate collagen production and improve skin texture and clarity.",
          },
        }),
        withSeo(svc("prp", "پی آر پی", "PRP", 3_100_000, 7), {
          fa: {
            shortDesc: "پی آر پی با پلاسمای خون خودتان برای جوان‌سازی و بازسازی پوست.",
            seoTitle: "پی آر پی | قیمت جوانسازی پوست",
            seoDescription: "قیمت و مشاوره پی آر پی (PRP) با استفاده از پلاسمای خون برای جوان‌سازی، بازسازی و بهبود کیفیت پوست.",
          },
          en: {
            shortDesc: "PRP uses your own blood plasma to rejuvenate and regenerate the skin.",
            seoTitle: "PRP | Price for Skin Rejuvenation",
            seoDescription: "PRP price using your own blood plasma to rejuvenate, regenerate and improve skin quality.",
          },
        }),
        withSeo(svc("hair-filler", "هیر فیلر", "Hair Filler", 4_890_000, 8), {
          fa: {
            shortDesc: "هیر فیلر برای تقویت رشد، ضخامت و سلامت موهای سر.",
            seoTitle: "هیر فیلر | قیمت تقویت مو",
            seoDescription: "قیمت و مشاوره هیر فیلر برای تقویت رشد، افزایش ضخامت و بهبود سلامت موی سر.",
          },
          en: {
            shortDesc: "Hair filler to strengthen growth, density and the overall health of scalp hair.",
            seoTitle: "Hair Filler | Price for Hair Growth",
            seoDescription: "Hair filler price and consultation to strengthen growth, increase density and improve scalp health.",
          },
        }),
        withSeo(svc("jalupro-pink", "جالبرو صورتی", "Jalupro Pink", 12_900_000, 9), {
          fa: {
            shortDesc: "جالبرو صورتی برای آبرسانی و جوان‌سازی عمیق پوست.",
            seoTitle: "جالبرو صورتی | قیمت",
            seoDescription: "قیمت و مشاوره تزریق جالبرو صورتی (Jalupro) برای آبرسانی، شادابی و جوان‌سازی پوست.",
          },
          en: {
            shortDesc: "Jalupro Pink for deep hydration and skin rejuvenation.",
            seoTitle: "Jalupro Pink | Price",
            seoDescription: "Jalupro Pink price and consultation for deep hydration and skin rejuvenation.",
          },
        }),
        withSeo(svc("jalupro-classic-blue", "جالبرو آبی کلاسیک", "Jalupro Classic Blue", 11_900_000, 10), {
          fa: {
            shortDesc: "جالبرو آبی کلاسیک برای بازسازی و بهبود کیفیت پوست.",
            seoTitle: "جالبرو آبی کلاسیک | قیمت",
            seoDescription: "قیمت و مشاوره تزریق جالبرو آبی کلاسیک (Jalupro) برای بازسازی، سفت‌شدن و بهبود کیفیت پوست.",
          },
          en: {
            shortDesc: "Jalupro Classic Blue to regenerate and improve skin quality.",
            seoTitle: "Jalupro Classic Blue | Price",
            seoDescription: "Jalupro Classic Blue price and consultation to regenerate and improve overall skin quality.",
          },
        }),
        withSeo(svc("jalupro-super-hydro", "جالبرو سویر هیدرو", "Jalupro Super Hydro", 19_900_000, 11), {
          fa: {
            shortDesc: "جالبرو سویر هیدرو برای آبرسانی فوق‌عمیق و شادابی پوست.",
            seoTitle: "جالبرو سویر هیدرو | قیمت",
            seoDescription: "قیمت و مشاوره جالبرو سویر هیدرو (Jalupro) برای آبرسانی فوق‌عمیق، شادابی و جوان‌سازی پوست.",
          },
          en: {
            shortDesc: "Jalupro Super Hydro for deep hydration and radiant, refreshed skin.",
            seoTitle: "Jalupro Super Hydro | Price",
            seoDescription: "Jalupro Super Hydro price and consultation for extra-deep hydration and refreshed, radiant skin.",
          },
        }),
        withSeo(svc("jalupro-pang-i", "جالبرو پانگ آی", "Jalupro Pang-I", 15_890_000, 12), {
          fa: {
            shortDesc: "جالبرو پانگ آی برای آبرسانی، بازسازی و شادابی پوست.",
            seoTitle: "جالبرو پانگ آی | قیمت",
            seoDescription: "قیمت و مشاوره تزریق جالبرو پانگ آی (Jalupro) برای آبرسانی، بازسازی و شادابی پوست.",
          },
          en: {
            shortDesc: "Jalupro Pang-I to hydrate, regenerate and refresh the skin.",
            seoTitle: "Jalupro Pang-I | Price",
            seoDescription: "Jalupro Pang-I price and consultation for hydration, regeneration and refreshed-looking skin.",
          },
        }),
        withSeo(svc("profhilo", "پروفایلو", "Profhilo", 16_290_000, 13), {
          fa: {
            shortDesc: "پروفایلو برای آبرسانی عمیق، سفت‌شدن و جوان‌سازی پوست.",
            seoTitle: "پروفایلو | قیمت جوانسازی پوست",
            seoDescription: "قیمت و مشاوره تزریق پروفایلو (Profhilo) برای آبرسانی عمیق، سفت‌شدن و جوان‌سازی پوست.",
          },
          en: {
            shortDesc: "Profhilo for deep hydration, firming and overall skin rejuvenation.",
            seoTitle: "Profhilo | Price for Skin Rejuvenation",
            seoDescription: "Profhilo price and consultation for deep hydration, firmness and overall skin rejuvenation.",
          },
        }),
      ],
    },
  ],
};