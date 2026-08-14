import type { SeedCategory } from "./types";
import { svc, withSeo } from "./types";

export const FILLER_UNDEREYE_CATEGORY: SeedCategory = {
      slug: "filler-undereye-nose-temple-forehead",
      icon: "eye",
      displayOrder: 1,
      i18n: [
        {
          locale: "fa",
          name: "فیلر زیرچشم - بینی - شقیقه - پیشانی",
          description:
            "رفع گودی و تیرگی زیرچشم، فرم‌دهی بینی، شقیقه و پیشانی با فیلر؛ برای چهره‌ای شاداب‌تر و متعادل.",
          seoTitle: "فیلر زیرچشم، بینی، شقیقه و پیشانی | قیمت",
          seoDescription:
            "قیمت و مشاوره تزریق فیلر زیرچشم، بینی، شقیقه و پیشانی؛ رفع تیرگی و گودی زیر چشم و فرم‌دهی ظریف و طبیعی چهره.",
        },
        {
          locale: "en",
          name: "Undereye - Nose - Temple - Forehead Filler",
          description:
            "Reduce undereye hollowness and dark circles, and refine the nose, temples and forehead with filler for a fresher, balanced look.",
          seoTitle: "Undereye, Nose, Temple & Forehead Filler | Prices",
          seoDescription:
            "Undereye, nose, temple and forehead filler prices and consultation. Address hollowness and refine facial contours with natural-looking results.",
        },
      ],
      services: [
        withSeo(svc("innovance-undereye-nose-temple", "اینووسنس", "Innovance", 5_490_000, 0), {
          fa: {
            shortDesc: "فیلر اینووسنس برای رفع گودی و تیرگی زیرچشم و فرم‌دهی بینی، شقیقه و پیشانی.",
            seoTitle: "فیلر اینووسنس | قیمت زیرچشم، بینی و شقیقه",
            seoDescription:
              "قیمت و مشاوره تزریق فیلر اینووسنس (Innovance) برای زیرچشم، بینی، شقیقه و پیشانی؛ رفع گودی و فرم‌دهی طبیعی چهره.",
          },
          en: {
            shortDesc: "Innovance filler to reduce undereye hollowness and refine the nose, temples and forehead.",
            seoTitle: "Innovance Filler | Price for Undereye, Nose & Temple",
            seoDescription:
              "Innovance filler prices and consultation for undereye, nose, temple and forehead. Reduce hollowness with natural-looking results.",
          },
        }),
        withSeo(svc("fillerge-undereye-nose-temple", "فیورج", "Fillerge", 4_890_000, 1), {
          fa: {
            shortDesc: "فیلر فیورج برای رفع گودی و تیرگی زیرچشم و فرم‌دهی بینی، شقیقه و پیشانی.",
            seoTitle: "فیلر فیورج | قیمت زیرچشم، بینی و شقیقه",
            seoDescription:
              "قیمت و مشاوره تزریق فیلر فیورج (Fillerge) برای زیرچشم، بینی، شقیقه و پیشانی؛ رفع گودی و فرم‌دهی طبیعی چهره.",
          },
          en: {
            shortDesc: "Fillerge filler to reduce undereye hollowness and refine the nose, temples and forehead.",
            seoTitle: "Fillerge Filler | Price for Undereye, Nose & Temple",
            seoDescription:
              "Fillerge filler prices and consultation for undereye, nose, temple and forehead. Reduce hollowness with natural-looking results.",
          },
        }),
        withSeo(svc("neuramis-undereye-nose-temple", "نورامیس", "Neuramis", 4_790_000, 2), {
          fa: {
            shortDesc: "فیلر نورامیس برای رفع گودی و تیرگی زیرچشم و فرم‌دهی بینی، شقیقه و پیشانی.",
            seoTitle: "فیلر نورامیس | قیمت زیرچشم، بینی و شقیقه",
            seoDescription:
              "قیمت و مشاوره تزریق فیلر نورامیس (Neuramis) برای زیرچشم، بینی، شقیقه و پیشانی؛ رفع گودی و فرم‌دهی طبیعی چهره.",
          },
          en: {
            shortDesc: "Neuramis filler to reduce undereye hollowness and refine the nose, temples and forehead.",
            seoTitle: "Neuramis Filler | Price for Undereye, Nose & Temple",
            seoDescription:
              "Neuramis filler prices and consultation for undereye, nose, temple and forehead. Reduce hollowness with natural-looking results.",
          },
        }),
      ],
};
