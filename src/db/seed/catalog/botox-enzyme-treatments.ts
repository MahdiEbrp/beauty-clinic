import type { SeedGroup } from "./types";
import { svc, withSeo } from "./types";
import { IMG } from "../images";

export const BOTOX_ENZYME_GROUP: SeedGroup = {
  slug: "botox-enzyme-treatments",
  icon: "droplet",
  image: IMG.botox,
  displayOrder: 2,
  i18n: [
    {
      locale: "fa",
      name: "بوتاکس و آنزیم",
      description:
        "با بوتاکس و خدماتی اصلاحی آنزیم، خطوط صورت را نرم‌تر کرده و فرم و تعادل چهره را متناسب با ویژگی‌های شما بهبود دهید.",
      seoTitle: "بوتاکس و آنزیم | خدمات زیبایی و اصلاح فیلر",
      seoDescription:
        "خدمات تخصصی بوتاکس و آنزیم برای فرم‌دهی چهره، کاهش خطوط، تعریق زیربغل و اصلاح فیلر؛ متناسب با نیاز و ویژگی‌های شما.",
    },
    {
      locale: "en",
      name: "Botox & Enzyme Services",
      description:
        "Refine your features, soften expression lines, and restore facial balance with personalized Botox and filler-correction services tailored to your aesthetic goals.",
      seoTitle: "Botox & Enzyme Services | Facial Aesthetics",
      seoDescription:
        "Discover personalized Botox and enzyme services for facial refinement, expression lines, underarm sweating, and filler correction. Book your consultation.",
    },
  ],
  categories: [
    {
      slug: "botox-massyvort",
      icon: "syringe",
      displayOrder: 0,
      i18n: [
        {
          locale: "fa",
          name: "بوتاکس مصیورت",
          description:
            "تزریق بوتاکس مصیورت (Massyvort) شامل فول فیس، چشم گربه‌ای و زیر بغل؛ کاهش خطوط و فرم‌دهی طبیعی چهره با برند معتبر.",
          seoTitle: "بوتاکس مصیورت | قیمت تزریق",
          seoDescription:
            "قیمت و مشاوره تزریق بوتاکس مصیورت (Massyvort) برای فول فیس، چشم گربه‌ای و زیر بغل؛ کاهش خطوط و فرم‌دهی طبیعی چهره.",
        },
        {
          locale: "en",
          name: "Massyvort Botox",
          description:
            "Massyvort Botox injections for full face, cat eye and underarm services — soften expression lines and refine your look naturally.",
          seoTitle: "Massyvort Botox | Price & Expert Injection",
          seoDescription:
            "Massyvort Botox prices and expert consultation for full face, cat eye and underarm services to soften lines and refine your look.",
        },
      ],
      services: [
        withSeo(svc("botox-full-face", "بوتاکس فول فیس", "Full Face Botox", 1_490_000, 0), {
          fa: {
            shortDesc:
              "بوتاکس فول فیس با برند مصیورت؛ کاهش خطوط پیشانی، دور چشم و پنجه کلاغی برای چهره‌ای جوان‌تر و طبیعی.",
            seoTitle: "بوتاکس فول فیس | قیمت تزریق",
            seoDescription:
              "قیمت و مشاوره بوتاکس فول فیس با برند مصیورت؛ کاهش خطوط پیشانی، دور چشم و پنجه کلاغی برای چهره‌ای جوان‌تر و طبیعی.",
          },
          en: {
            shortDesc:
              "Full face Botox with Massyvort to soften forehead, frown lines and crow's feet for a younger, natural-looking result.",
            seoTitle: "Full Face Botox | Price & Expert Injection",
            seoDescription:
              "Full face Botox prices with Massyvort for forehead, frown lines and crow's feet — softer, more youthful and natural-looking results.",
          },
        }),
        withSeo(svc("botox-cat-eye", "بوتاکس چشم گربه‌ای", "Cat Eye Botox", 1_290_000, 1), {
          fa: {
            shortDesc:
              "بوتاکس چشم گربه‌ای (Cat Eye) برای لیفت و فرم‌دهی ابرو و گوشه چشم؛ ظاهری جذاب و طبیعی.",
            seoTitle: "بوتاکس چشم گربه‌ای | قیمت تزریق",
            seoDescription:
              "قیمت و مشاوره بوتاکس چشم گربه‌ای (Cat Eye) برای لیفت و فرم‌دهی ابرو و گوشه چشم؛ ظاهری جذاب و طبیعی.",
          },
          en: {
            shortDesc:
              "Cat eye Botox to lift and shape the brow and eye corners for an attractive, natural feline look.",
            seoTitle: "Cat Eye Botox | Price & Expert Injection",
            seoDescription:
              "Cat eye Botox prices for brow lift and eye-corner shaping that creates an attractive, natural-looking feline lift.",
          },
        }),
        withSeo(svc("botox-underarm", "بوتاکس زیر بغل", "Underarm Botox", 2_500_000, 2), {
          fa: {
            shortDesc:
              "بوتاکس زیر بغل برای کاهش تعریق شدید و بوی بدن؛ نتیجه‌ای ماندگار و بدون نیاز به جراحی.",
            seoTitle: "بوتاکس زیر بغل | قیمت خدمت تعریق",
            seoDescription:
              "قیمت و مشاوره بوتاکس زیر بغل برای کاهش تعریق شدید و بوی بدن؛ نتیجه‌ای ماندگار و بدون نیاز به جراحی.",
          },
          en: {
            shortDesc:
              "Underarm Botox to reduce excessive sweating and odor — long-lasting, non-surgical relief with expert care.",
            seoTitle: "Underarm Botox | Price for Excessive Sweating",
            seoDescription:
              "Underarm Botox price for reducing excessive sweating and odor. Long-lasting, non-surgical relief with expert care.",
          },
        }),
      ],
    },
    {
      slug: "enzyme",
      icon: "droplet",
      displayOrder: 1,
      i18n: [
        {
          locale: "fa",
          name: "آنزیم",
          description:
            "تزریق آنزیم کره‌ای و انگلیسی برای اصلاح و حذف طبیعی فیلر اضافی؛ روشی دقیق و متناسب با نیاز شما.",
          seoTitle: "آنزیم | قیمت و خدمت اصلاح فیلر",
          seoDescription:
            "قیمت و مشاوره تزریق آنزیم کره‌ای و انگلیسی برای اصلاح فیلر و حذف طبیعی مواد؛ با رویکردی دقیق و متناسب با نیاز شما.",
        },
        {
          locale: "en",
          name: "Enzyme",
          description:
            "Korean and English enzyme injections to gently correct and dissolve excess filler with expert precision.",
          seoTitle: "Enzyme Service | Price & Filler Correction",
          seoDescription:
            "Enzyme service prices (Korean and English formulas) for gentle filler correction and dissolving, delivered with expert precision.",
        },
      ],
      services: [
        withSeo(svc("enzyme-korean", "آنزیم کره‌ای", "Korean Enzyme", 1_290_000, 0), {
          fa: {
            shortDesc:
              "آنزیم کره‌ای برای اصلاح و حذف فیلر اضافی؛ روشی ملایم و طبیعی برای بازگرداندن تعادل چهره.",
            seoTitle: "آنزیم کره‌ای | قیمت اصلاح فیلر",
            seoDescription:
              "قیمت و مشاوره تزریق آنزیم کره‌ای برای اصلاح و حذف فیلر اضافی؛ روشی ملایم و طبیعی برای بازگرداندن تعادل چهره.",
          },
          en: {
            shortDesc:
              "Korean enzyme to gently correct and dissolve excess filler, restoring natural facial balance.",
            seoTitle: "Korean Enzyme | Price for Filler Correction",
            seoDescription:
              "Korean enzyme price for gentle correction and dissolving of excess filler, restoring natural facial balance with expert care.",
          },
        }),
        withSeo(svc("enzyme-english", "آنزیم انگلیسی", "English Enzyme", 1_690_000, 1), {
          fa: {
            shortDesc:
              "آنزیم انگلیسی برای اصلاح و حذف فیلر اضافی؛ روشی ملایم و طبیعی برای بازگرداندن تعادل چهره.",
            seoTitle: "آنزیم انگلیسی | قیمت اصلاح فیلر",
            seoDescription:
              "قیمت و مشاوره تزریق آنزیم انگلیسی برای اصلاح و حذف فیلر اضافی؛ روشی ملایم و طبیعی برای بازگرداندن تعادل چهره.",
          },
          en: {
            shortDesc:
              "English enzyme to gently correct and dissolve excess filler, restoring natural facial balance.",
            seoTitle: "English Enzyme | Price for Filler Correction",
            seoDescription:
              "English enzyme price for gentle correction and dissolving of excess filler, restoring natural facial balance with expert care.",
          },
        }),
      ],
    },
  ],
};