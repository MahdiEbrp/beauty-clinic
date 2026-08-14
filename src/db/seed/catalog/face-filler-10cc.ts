import type { SeedCategory } from "./types";
import { svc, withSeo } from "./types";

export const FILLER_10CC_CATEGORY: SeedCategory = {
      slug: "filler-10cc-packs",
      icon: "gift",
      displayOrder: 2,
      i18n: [
        {
          locale: "fa",
          name: "پک های 10 سی سی",
          description:
            "برندهایی که دارای پک ده سی سی هستند را برای تزریق ناحیه لب پیشنهاد نمی‌کنیم.",
          seoTitle: "پک فیلر 10 سی سی | قیمت و خرید",
          seoDescription:
            "قیمت پک فیلر 10 سی سی برای تزریق در نواحی بدن و صورت؛ مشاوره حرفه‌ای برای انتخاب برند مناسب. (پک 10 سی سی برای ناحیه لب پیشنهاد نمی‌شود.)",
        },
        {
          locale: "en",
          name: "10cc Packs",
          description:
            "We don't recommend brands that have 10cc packs for lip injections.",
          seoTitle: "10cc Filler Packs | Price & Booking",
          seoDescription:
            "10cc filler pack prices for face and body injections with expert guidance on choosing the right brand. (10cc packs aren't recommended for lips.)",
        },
      ],
      services: [
        withSeo(svc("aptq-10cc", "ای.پی.تی.کیو", "APTQ 10cc", 21_900_000, 0), {
          fa: {
            shortDesc: "پک 10 سی سی فیلر ای.پی.تی.کیو برای تزریق در نواحی مختلف صورت و بدن.",
            seoTitle: "پک 10 سی سی ای.پی.تی.کیو | قیمت",
            seoDescription:
              "قیمت پک 10 سی سی فیلر ای.پی.تی.کیو (APTQ) برای تزریق در نواحی مختلف صورت و بدن؛ با مشاوره حرفه‌ای و رزرو آنلاین.",
          },
          en: {
            shortDesc: "APTQ 10cc filler pack for injections across different face and body areas.",
            seoTitle: "APTQ 10cc Filler Pack | Price & Booking",
            seoDescription:
              "APTQ 10cc filler pack price for face and body injections with expert consultation and online booking.",
          },
        }),
        withSeo(svc("zeishel-10cc", "زیشل", "Zeishel 10cc", 18_900_000, 1), {
          fa: {
            shortDesc: "پک 10 سی سی فیلر زیشل برای تزریق در نواحی مختلف صورت و بدن.",
            seoTitle: "پک 10 سی سی زیشل | قیمت",
            seoDescription:
              "قیمت پک 10 سی سی فیلر زیشل (Zeishel) برای تزریق در نواحی مختلف صورت و بدن؛ با مشاوره حرفه‌ای و رزرو آنلاین.",
          },
          en: {
            shortDesc: "Zeishel 10cc filler pack for injections across different face and body areas.",
            seoTitle: "Zeishel 10cc Filler Pack | Price & Booking",
            seoDescription:
              "Zeishel 10cc filler pack price for face and body injections with expert consultation and online booking.",
          },
        }),
        withSeo(svc("denby-10cc", "دنبی", "Denby 10cc", 16_900_000, 2), {
          fa: {
            shortDesc: "پک 10 سی سی فیلر دنبی برای تزریق در نواحی مختلف صورت و بدن.",
            seoTitle: "پک 10 سی سی دنبی | قیمت",
            seoDescription:
              "قیمت پک 10 سی سی فیلر دنبی (Denby) برای تزریق در نواحی مختلف صورت و بدن؛ با مشاوره حرفه‌ای و رزرو آنلاین.",
          },
          en: {
            shortDesc: "Denby 10cc filler pack for injections across different face and body areas.",
            seoTitle: "Denby 10cc Filler Pack | Price & Booking",
            seoDescription:
              "Denby 10cc filler pack price for face and body injections with expert consultation and online booking.",
          },
        }),
        withSeo(svc("revofil-10cc", "رووفیل", "Revofil 10cc", 13_900_000, 3), {
          fa: {
            shortDesc: "پک 10 سی سی فیلر رووفیل برای تزریق در نواحی مختلف صورت و بدن.",
            seoTitle: "پک 10 سی سی رووفیل | قیمت",
            seoDescription:
              "قیمت پک 10 سی سی فیلر رووفیل (Revofil) برای تزریق در نواحی مختلف صورت و بدن؛ با مشاوره حرفه‌ای و رزرو آنلاین.",
          },
          en: {
            shortDesc: "Revofil 10cc filler pack for injections across different face and body areas.",
            seoTitle: "Revofil 10cc Filler Pack | Price & Booking",
            seoDescription:
              "Revofil 10cc filler pack price for face and body injections with expert consultation and online booking.",
          },
        }),
        withSeo(svc("audrey-10cc", "اودری", "Audrey 10cc", 11_900_000, 4), {
          fa: {
            shortDesc: "پک 10 سی سی فیلر اودری برای تزریق در نواحی مختلف صورت و بدن.",
            seoTitle: "پک 10 سی سی اودری | قیمت",
            seoDescription:
              "قیمت پک 10 سی سی فیلر اودری (Audrey) برای تزریق در نواحی مختلف صورت و بدن؛ با مشاوره حرفه‌ای و رزرو آنلاین.",
          },
          en: {
            shortDesc: "Audrey 10cc filler pack for injections across different face and body areas.",
            seoTitle: "Audrey 10cc Filler Pack | Price & Booking",
            seoDescription:
              "Audrey 10cc filler pack price for face and body injections with expert consultation and online booking.",
          },
        }),
      ],
};
