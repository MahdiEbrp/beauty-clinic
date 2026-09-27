import type { SeedCategory } from "./types";
import { svc, withSeo } from "./types";

/**
 * "بوتاکس" — one category per treatment type (full face / cat eye / gummy smile
 * / sweating / migraine) so each appears as its own sub-item in the services
 * menu and on the pricing page. Prices match the clinic's price list.
 *
 * Category and service slugs are intentionally identical (they live in separate
 * globally-unique indexes).
 */
export const BOTOX_CATEGORIES: SeedCategory[] = [
  {
    slug: "botox-full-face",
    icon: "syringe",
    displayOrder: 0,
    i18n: [
      {
        locale: "fa",
        name: "بوتاکس فول فیس",
        description:
          "بوتاکس فول فیس؛ کاهش خطوط پیشانی، دور چشم و پنجه کلاغی برای چهره‌ای جوان‌تر و طبیعی.",
        seoTitle: "بوتاکس فول فیس | قیمت تزریق",
        seoDescription:
          "قیمت و مشاوره بوتاکس فول فیس؛ کاهش خطوط پیشانی، دور چشم و پنجه کلاغی برای چهره‌ای جوان‌تر و طبیعی.",
      },
      {
        locale: "en",
        name: "Full Face Botox",
        description:
          "Full face Botox to soften forehead, frown lines and crow's feet for a younger, natural-looking result.",
        seoTitle: "Full Face Botox | Price & Injection",
        seoDescription:
          "Full face Botox prices for forehead, frown lines and crow's feet — softer, more youthful and natural-looking results.",
      },
    ],
    services: [
      withSeo(svc("botox-full-face", "بوتاکس فول فیس", "Full Face Botox", 1_890_000, 0), {
        fa: {
          shortDesc:
            "بوتاکس فول فیس؛ کاهش خطوط پیشانی، دور چشم و پنجه کلاغی برای چهره‌ای جوان‌تر و طبیعی.",
          seoTitle: "بوتاکس فول فیس | قیمت تزریق",
          seoDescription:
            "قیمت و مشاوره بوتاکس فول فیس؛ کاهش خطوط پیشانی، دور چشم و پنجه کلاغی برای چهره‌ای جوان‌تر و طبیعی.",
        },
        en: {
          shortDesc:
            "Full face Botox to soften forehead, frown lines and crow's feet for a younger, natural-looking result.",
          seoTitle: "Full Face Botox | Price & Expert Injection",
          seoDescription:
            "Full face Botox prices for forehead, frown lines and crow's feet — softer, more youthful and natural-looking results.",
        },
      }),
    ],
  },
  {
    slug: "botox-cat-eye",
    icon: "syringe",
    displayOrder: 1,
    i18n: [
      {
        locale: "fa",
        name: "بوتاکس چشم گربه‌ای",
        description:
          "بوتاکس چشم گربه‌ای برای لیفت و فرم‌دهی ابرو و گوشه چشم؛ ظاهری جذاب و طبیعی.",
        seoTitle: "بوتاکس چشم گربه‌ای | قیمت تزریق",
        seoDescription:
          "قیمت و مشاوره بوتاکس چشم گربه‌ای برای لیفت و فرم‌دهی ابرو و گوشه چشم؛ ظاهری جذاب و طبیعی.",
      },
      {
        locale: "en",
        name: "Cat Eye Botox",
        description:
          "Cat eye Botox to lift and shape the brow and eye corners for an attractive, natural feline look.",
        seoTitle: "Cat Eye Botox | Price & Injection",
        seoDescription:
          "Cat eye Botox prices for brow lift and eye-corner shaping that creates an attractive, natural-looking feline lift.",
      },
    ],
    services: [
      withSeo(svc("botox-cat-eye", "بوتاکس چشم گربه‌ای", "Cat Eye Botox", 1_690_000, 0), {
        fa: {
          shortDesc:
            "بوتاکس چشم گربه‌ای برای لیفت و فرم‌دهی ابرو و گوشه چشم؛ ظاهری جذاب و طبیعی.",
          seoTitle: "بوتاکس چشم گربه‌ای | قیمت تزریق",
          seoDescription:
            "قیمت و مشاوره بوتاکس چشم گربه‌ای برای لیفت و فرم‌دهی ابرو و گوشه چشم؛ ظاهری جذاب و طبیعی.",
        },
        en: {
          shortDesc:
            "Cat eye Botox to lift and shape the brow and eye corners for an attractive, natural feline look.",
          seoTitle: "Cat Eye Botox | Price & Expert Injection",
          seoDescription:
            "Cat eye Botox prices for brow lift and eye-corner shaping that creates an attractive, natural-looking feline lift.",
        },
      }),
    ],
  },
  {
    slug: "botox-gummy-smile",
    icon: "syringe",
    displayOrder: 2,
    i18n: [
      {
        locale: "fa",
        name: "بوتاکس لبخند لثه‌ای",
        description:
          "بوتاکس لبخند لثه‌ای برای کاهش نمایش بیش از حد لثه هنگام خندیدن؛ لبخندی طبیعی‌تر.",
        seoTitle: "بوتاکس لبخند لثه‌ای | قیمت تزریق",
        seoDescription:
          "قیمت و مشاوره بوتاکس لبخند لثه‌ای برای کاهش نمایش بیش از حد لثه هنگام خندیدن؛ لبخندی طبیعی‌تر و زیباتر.",
      },
      {
        locale: "en",
        name: "Gummy Smile Botox",
        description:
          "Gummy smile Botox to reduce excessive gum display when smiling for a more natural smile.",
        seoTitle: "Gummy Smile Botox | Price & Injection",
        seoDescription:
          "Gummy smile Botox price to reduce excessive gum display when smiling, for a more natural, beautiful smile.",
      },
    ],
    services: [
      withSeo(svc("botox-gummy-smile", "بوتاکس لبخند لثه‌ای", "Gummy Smile Botox", 890_000, 0), {
        fa: {
          shortDesc:
            "بوتاکس لبخند لثه‌ای برای کاهش نمایش بیش از حد لثه هنگام خندیدن؛ لبخندی طبیعی‌تر.",
          seoTitle: "بوتاکس لبخند لثه‌ای | قیمت تزریق",
          seoDescription:
            "قیمت و مشاوره بوتاکس لبخند لثه‌ای برای کاهش نمایش بیش از حد لثه هنگام خندیدن؛ لبخندی طبیعی‌تر و زیباتر.",
        },
        en: {
          shortDesc:
            "Gummy smile Botox to reduce excessive gum display when smiling for a more natural smile.",
          seoTitle: "Gummy Smile Botox | Price & Expert Injection",
          seoDescription:
            "Gummy smile Botox price to reduce excessive gum display when smiling, for a more natural, beautiful smile.",
        },
      }),
    ],
  },
  {
    slug: "botox-sweating",
    icon: "syringe",
    displayOrder: 3,
    i18n: [
      {
        locale: "fa",
        name: "بوتاکس تعریق",
        description:
          "بوتاکس تعریق برای کاهش تعریق شدید؛ نتیجه‌ای ماندگار و بدون نیاز به جراحی.",
        seoTitle: "بوتاکس تعریق | قیمت خدمت تعریق",
        seoDescription:
          "قیمت و مشاوره بوتاکس تعریق برای کاهش تعریق شدید؛ نتیجه‌ای ماندگار و بدون نیاز به جراحی.",
      },
      {
        locale: "en",
        name: "Sweating Botox",
        description:
          "Sweating Botox to reduce excessive perspiration — long-lasting, non-surgical relief with expert care.",
        seoTitle: "Sweating Botox | Price for Excessive Sweating",
        seoDescription:
          "Sweating Botox price for reducing excessive perspiration. Long-lasting, non-surgical relief with expert care.",
      },
    ],
    services: [
      withSeo(svc("botox-sweating", "بوتاکس تعریق", "Sweating Botox", 3_290_000, 0), {
        fa: {
          shortDesc:
            "بوتاکس تعریق برای کاهش تعریق شدید؛ نتیجه‌ای ماندگار و بدون نیاز به جراحی.",
          seoTitle: "بوتاکس تعریق | قیمت خدمت تعریق",
          seoDescription:
            "قیمت و مشاوره بوتاکس تعریق برای کاهش تعریق شدید؛ نتیجه‌ای ماندگار و بدون نیاز به جراحی.",
        },
        en: {
          shortDesc:
            "Sweating Botox to reduce excessive perspiration — long-lasting, non-surgical relief with expert care.",
          seoTitle: "Sweating Botox | Price for Excessive Sweating",
          seoDescription:
            "Sweating Botox price for reducing excessive perspiration. Long-lasting, non-surgical relief with expert care.",
        },
      }),
    ],
  },
  {
    slug: "botox-migraine",
    icon: "syringe",
    displayOrder: 4,
    i18n: [
      {
        locale: "fa",
        name: "بوتاکس میگرن",
        description:
          "بوتاکس میگرن برای کنترل و کاهش حملات میگرن؛ زیر نظر پزشک متخصص.",
        seoTitle: "بوتاکس میگرن | قیمت تزریق",
        seoDescription:
          "قیمت و مشاوره بوتاکس میگرن برای کنترل و کاهش حملات میگرن؛ تزریق زیر نظر پزشک متخصص.",
      },
      {
        locale: "en",
        name: "Migraine Botox",
        description:
          "Migraine Botox to control and reduce migraine attacks, administered by a specialist physician.",
        seoTitle: "Migraine Botox | Price & Expert Injection",
        seoDescription:
          "Migraine Botox price to control and reduce migraine attacks; injections administered by a specialist physician.",
      },
    ],
    services: [
      withSeo(svc("botox-migraine", "بوتاکس میگرن", "Migraine Botox", 2_390_000, 0), {
        fa: {
          shortDesc:
            "بوتاکس میگرن برای کنترل و کاهش حملات میگرن؛ زیر نظر پزشک متخصص.",
          seoTitle: "بوتاکس میگرن | قیمت تزریق",
          seoDescription:
            "قیمت و مشاوره بوتاکس میگرن برای کنترل و کاهش حملات میگرن؛ تزریق زیر نظر پزشک متخصص.",
        },
        en: {
          shortDesc:
            "Migraine Botox to control and reduce migraine attacks, administered by a specialist physician.",
          seoTitle: "Migraine Botox | Price & Expert Injection",
          seoDescription:
            "Migraine Botox price to control and reduce migraine attacks; injections administered by a specialist physician.",
        },
      }),
    ],
  },
];
