import type { SeedCategory } from "./types";
import { svc, withSeo } from "./types";

/**
 * "پک ۱۰ سی‌سی کانتورینگ" — Mahdi's price list: APTQ / Zeishel / Denby /
 * Revofil / Audrey.
 */
export const FILLER_10CC_CATEGORY: SeedCategory = {
  slug: "filler-10cc-packs",
  icon: "gift",
  displayOrder: 2,
  i18n: [
    {
      locale: "fa",
      name: "پک ۱۰ سی‌سی کانتورینگ",
      description:
        "پک‌های ۱۰ سی‌سی فیلر برای کانتورینگ و حجم‌دهی چند ناحیه‌ی صورت و بدن؛ اقتصادی‌ترین گزینه برای پکیج‌های فول فیس.",
      seoTitle: "پک ۱۰ سی‌سی کانتورینگ | قیمت",
      seoDescription:
        "قیمت پک ۱۰ سی‌سی فیلر برای کانتورینگ صورت و بدن؛ مشاوره حرفه‌ای برای انتخاب برند مناسب. (پک ۱۰ سی‌سی برای ناحیه لب پیشنهاد نمی‌شود.)",
    },
    {
      locale: "en",
      name: "10cc Contouring Packs",
      description:
        "10cc filler packs for contouring and volumizing several face and body areas — the most economical option for full-face packages.",
      seoTitle: "10cc Contouring Packs | Price",
      seoDescription:
        "10cc filler pack prices for face and body contouring with expert guidance on choosing the right brand. (10cc packs aren't recommended for lips.)",
    },
  ],
  services: [
    withSeo(svc("aptq-10cc", "اپی تی کیو", "APTQ 10cc", 24_900_000, 0), {
      fa: {
        shortDesc: "پک ۱۰ سی‌سی فیلر اپی تی کیو برای کانتورینگ نواحی مختلف صورت و بدن.",
        seoTitle: "پک ۱۰ سی‌سی اپی تی کیو | قیمت",
        seoDescription:
          "قیمت پک ۱۰ سی‌سی فیلر اپی تی کیو (APTQ) برای کانتورینگ نواحی مختلف صورت و بدن؛ با مشاوره حرفه‌ای و رزرو آنلاین.",
      },
      en: {
        shortDesc: "APTQ 10cc filler pack for contouring different face and body areas.",
        seoTitle: "APTQ 10cc Filler Pack | Price",
        seoDescription:
          "APTQ 10cc filler pack price for face and body contouring with expert consultation and online booking.",
      },
    }),
    withSeo(svc("zeishel-10cc", "زیشل", "Zeishel 10cc", 20_900_000, 1), {
      fa: {
        shortDesc: "پک ۱۰ سی‌سی فیلر زیشل برای کانتورینگ نواحی مختلف صورت و بدن.",
        seoTitle: "پک ۱۰ سی‌سی زیشل | قیمت",
        seoDescription:
          "قیمت پک ۱۰ سی‌سی فیلر زیشل (Zeishel) برای کانتورینگ نواحی مختلف صورت و بدن؛ با مشاوره حرفه‌ای و رزرو آنلاین.",
      },
      en: {
        shortDesc: "Zeishel 10cc filler pack for contouring different face and body areas.",
        seoTitle: "Zeishel 10cc Filler Pack | Price",
        seoDescription:
          "Zeishel 10cc filler pack price for face and body contouring with expert consultation and online booking.",
      },
    }),
    withSeo(svc("denby-10cc", "دنبی", "Denby 10cc", 18_900_000, 2), {
      fa: {
        shortDesc: "پک ۱۰ سی‌سی فیلر دنبی برای کانتورینگ نواحی مختلف صورت و بدن.",
        seoTitle: "پک ۱۰ سی‌سی دنبی | قیمت",
        seoDescription:
          "قیمت پک ۱۰ سی‌سی فیلر دنبی (Denby) برای کانتورینگ نواحی مختلف صورت و بدن؛ با مشاوره حرفه‌ای و رزرو آنلاین.",
      },
      en: {
        shortDesc: "Denby 10cc filler pack for contouring different face and body areas.",
        seoTitle: "Denby 10cc Filler Pack | Price",
        seoDescription:
          "Denby 10cc filler pack price for face and body contouring with expert consultation and online booking.",
      },
    }),
    withSeo(svc("revofil-10cc", "رووفیل", "Revofil 10cc", 15_900_000, 3), {
      fa: {
        shortDesc: "پک ۱۰ سی‌سی فیلر رووفیل برای کانتورینگ نواحی مختلف صورت و بدن.",
        seoTitle: "پک ۱۰ سی‌سی رووفیل | قیمت",
        seoDescription:
          "قیمت پک ۱۰ سی‌سی فیلر رووفیل (Revofil) برای کانتورینگ نواحی مختلف صورت و بدن؛ با مشاوره حرفه‌ای و رزرو آنلاین.",
      },
      en: {
        shortDesc: "Revofil 10cc filler pack for contouring different face and body areas.",
        seoTitle: "Revofil 10cc Filler Pack | Price",
        seoDescription:
          "Revofil 10cc filler pack price for face and body contouring with expert consultation and online booking.",
      },
    }),
    withSeo(svc("audrey-10cc", "اودری", "Audrey 10cc", 13_900_000, 4), {
      fa: {
        shortDesc: "پک ۱۰ سی‌سی فیلر اودری برای کانتورینگ نواحی مختلف صورت و بدن.",
        seoTitle: "پک ۱۰ سی‌سی اودری | قیمت",
        seoDescription:
          "قیمت پک ۱۰ سی‌سی فیلر اودری (Audrey) برای کانتورینگ نواحی مختلف صورت و بدن؛ با مشاوره حرفه‌ای و رزرو آنلاین.",
      },
      en: {
        shortDesc: "Audrey 10cc filler pack for contouring different face and body areas.",
        seoTitle: "Audrey 10cc Filler Pack | Price",
        seoDescription:
          "Audrey 10cc filler pack price for face and body contouring with expert consultation and online booking.",
      },
    }),
  ],
};
